import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { google } from 'npm:googleapis@140';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type BookingSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
};

const SLOT_MINUTES_DEFAULT = 15;
const SEARCH_DAYS_DEFAULT = 14;
const MAX_SLOTS_DEFAULT = 6;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function coerceServiceAccount(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  if (typeof obj.private_key === 'string') {
    obj.private_key = obj.private_key.replace(/\\n/g, '\n');
  }
  return obj;
}

function parseServiceAccountJson() {
  const raw = (Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || '').trim();
  if (!raw) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');

  const candidates: string[] = [raw];

  // Strip wrapping quotes if user set the secret with extra shell quoting.
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    candidates.push(raw.slice(1, -1));
  }

  // Base64 support (common for multiline secrets).
  try {
    const decoded = atob(raw);
    if (decoded && decoded.trim()) candidates.push(decoded.trim());
  } catch {
    // ignore
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === 'string') {
        const parsedTwice = JSON.parse(parsed);
        const coercedTwice = coerceServiceAccount(parsedTwice);
        if (coercedTwice) return coercedTwice;
      }
      const coerced = coerceServiceAccount(parsed);
      if (coerced) return coerced;
    } catch {
      // try next candidate
    }
  }

  throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
}

function getCalendarConfig() {
  const calendarId = Deno.env.get('GOOGLE_BOOKING_CALENDAR_ID') || Deno.env.get('GOOGLE_CALENDAR_ID') || '';
  if (!calendarId) throw new Error('Missing GOOGLE_BOOKING_CALENDAR_ID (or GOOGLE_CALENDAR_ID)');

  return {
    calendarId,
    timeZone: Deno.env.get('BOOKING_TIMEZONE') || 'Europe/London',
    searchDays: Number(Deno.env.get('BOOKING_SEARCH_DAYS') || SEARCH_DAYS_DEFAULT),
    slotMinutes: Number(Deno.env.get('BOOKING_SLOT_MINUTES') || SLOT_MINUTES_DEFAULT),
    maxSlots: Number(Deno.env.get('BOOKING_MAX_SLOTS') || MAX_SLOTS_DEFAULT),
  };
}

function buildLabel(isoStart: string, timeZone: string) {
  return new Date(isoStart).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  });
}

function roundToNextQuarter(date: Date) {
  const ms = 15 * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function isWeekday(date: Date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function withinWorkingHours(start: Date, end: Date) {
  const startHour = start.getHours() + start.getMinutes() / 60;
  const endHour = end.getHours() + end.getMinutes() / 60;
  return startHour >= WORK_START_HOUR && endHour <= WORK_END_HOUR;
}

async function getCalendarClient() {
  const oauthClientId = (Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '').trim();
  const oauthClientSecret = (Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '').trim();
  const oauthRefreshToken = (Deno.env.get('GOOGLE_OAUTH_REFRESH_TOKEN') || '').trim();

  // Preferred mode: user OAuth (supports attendee invites + Meet creation reliably).
  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const auth = new google.auth.OAuth2({
      clientId: oauthClientId,
      clientSecret: oauthClientSecret,
    });
    auth.setCredentials({ refresh_token: oauthRefreshToken });
    await auth.getAccessToken();
    return google.calendar({ version: 'v3', auth });
  }

  // Fallback mode: service account.
  const serviceAccount = parseServiceAccountJson();
  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  await auth.authorize();
  return google.calendar({ version: 'v3', auth });
}

async function getGmailClient() {
  const clientId = (Deno.env.get('GOOGLE_GMAIL_CLIENT_ID') || '').trim();
  const clientSecret = (Deno.env.get('GOOGLE_GMAIL_CLIENT_SECRET') || '').trim();
  const refreshToken = (Deno.env.get('GOOGLE_GMAIL_REFRESH_TOKEN') || '').trim();

  if (!clientId || !clientSecret || !refreshToken) return null;

  const auth = new google.auth.OAuth2({
    clientId,
    clientSecret,
  });
  auth.setCredentials({ refresh_token: refreshToken });
  await auth.getAccessToken();

  return google.gmail({ version: 'v1', auth });
}

function toBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sendOwnerConfirmationEmail(params: {
  ownerEmail: string;
  leadName: string;
  leadEmail: string;
  startIso: string;
  endIso: string;
  meetLink?: string | null;
  eventLink?: string | null;
}) {
  const gmail = await getGmailClient();
  if (!gmail) return false;

  const { ownerEmail, leadName, leadEmail, startIso, endIso, meetLink, eventLink } = params;
  const startLabel = new Date(startIso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const endLabel = new Date(endIso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const subject = `New TalkToBro booking — ${leadName}`;
  const body = [
    `A new TalkToBro call has been booked.`,
    '',
    `Name: ${leadName}`,
    `Email: ${leadEmail}`,
    `Time: ${startLabel} → ${endLabel}`,
    meetLink ? `Meet: ${meetLink}` : null,
    eventLink ? `Calendar event: ${eventLink}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const raw = toBase64Url([
    `To: ${ownerEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\n'));

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return true;
}

async function getBusyWindows(calendar: ReturnType<typeof google.calendar>, calendarId: string, timeMin: string, timeMax: string) {
  const freeBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const busy = freeBusy.data.calendars?.[calendarId]?.busy || [];
  return busy
    .map((window) => ({
      start: window.start ? new Date(window.start) : null,
      end: window.end ? new Date(window.end) : null,
    }))
    .filter((window): window is { start: Date; end: Date } => Boolean(window.start && window.end));
}

function buildCandidateSlots(
  now: Date,
  timeZone: string,
  searchDays: number,
  slotMinutes: number,
  maxSlots: number,
  busyWindows: Array<{ start: Date; end: Date }>,
) {
  const slots: BookingSlot[] = [];
  const slotMs = slotMinutes * 60 * 1000;
  const endSearch = new Date(now.getTime() + searchDays * 24 * 60 * 60 * 1000);

  let cursor = roundToNextQuarter(new Date(now.getTime() + 60 * 60 * 1000));

  while (cursor < endSearch && slots.length < maxSlots) {
    const slotEnd = new Date(cursor.getTime() + slotMs);

    if (isWeekday(cursor) && withinWorkingHours(cursor, slotEnd)) {
      const conflicts = busyWindows.some((busy) => overlaps(cursor, slotEnd, busy.start, busy.end));
      if (!conflicts) {
        const startIso = cursor.toISOString();
        const endIso = slotEnd.toISOString();
        slots.push({
          id: startIso,
          start: startIso,
          end: endIso,
          label: buildLabel(startIso, timeZone),
        });
      }
    }

    cursor = new Date(cursor.getTime() + slotMs);
  }

  return slots;
}

async function handleSlots(body: any) {
  const { calendarId, timeZone, searchDays, slotMinutes, maxSlots } = getCalendarConfig();
  const calendar = await getCalendarClient();

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + searchDays * 24 * 60 * 60 * 1000).toISOString();

  const busyWindows = await getBusyWindows(calendar, calendarId, timeMin, timeMax);
  const slots = buildCandidateSlots(now, timeZone, searchDays, slotMinutes, maxSlots, busyWindows);

  return json({
    ok: true,
    slots,
    meta: {
      slotMinutes,
      timeZone,
      count: slots.length,
      requestedBy: body?.email || null,
    },
  });
}

async function ensureSlotStillFree(calendar: ReturnType<typeof google.calendar>, calendarId: string, slotStartIso: string, slotEndIso: string) {
  const busyWindows = await getBusyWindows(calendar, calendarId, slotStartIso, slotEndIso);
  return busyWindows.length === 0;
}

async function handleBook(body: any) {
  const { calendarId, timeZone } = getCalendarConfig();
  const calendar = await getCalendarClient();

  const name = String(body?.name || '').trim();
  const email = String(body?.email || '').trim();
  const slotStart = String(body?.slotStart || body?.slotId || '').trim();
  const durationMinutes = Number(body?.durationMinutes || SLOT_MINUTES_DEFAULT);

  if (!name || !email || !slotStart) {
    return json({ error: 'name, email and slotStart/slotId are required' }, 400);
  }

  const startDate = new Date(slotStart);
  if (Number.isNaN(startDate.getTime())) {
    return json({ error: 'Invalid slotStart/slotId' }, 400);
  }

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const stillFree = await ensureSlotStillFree(calendar, calendarId, startDate.toISOString(), endDate.toISOString());
  if (!stillFree) {
    return json({ ok: false, error: 'Slot is no longer available. Please pick another.' }, 409);
  }

  const requestId = crypto.randomUUID();
  const ownerEmail = (Deno.env.get('BOOKING_OWNER_EMAIL') || 'benaiah@agentiveai.consulting').trim();
  const attendees = [{ email, displayName: name }];
  if (ownerEmail && ownerEmail.toLowerCase() !== email.toLowerCase()) {
    attendees.push({ email: ownerEmail, displayName: 'Benaiah' });
  }

  const baseRequestBody = {
    summary: `TalkToBro fit call — ${name}`,
    description: [
      `Booked via talktobro.com`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Source: ${String(body?.source || 'talktobro-web')}`,
    ].join('\n'),
    start: {
      dateTime: startDate.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone,
    },
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  let event;
  let invitedAttendee = true;
  let hasMeetLink = true;

  try {
    event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        ...baseRequestBody,
        attendees,
      },
    });
  } catch (err) {
    const message = String(err || '');
    const attendeeBlocked = message.includes('Domain-Wide Delegation') || message.includes('cannot invite attendees');

    if (!attendeeBlocked) {
      throw err;
    }

    invitedAttendee = false;

    try {
      event = await calendar.events.insert({
        calendarId,
        conferenceDataVersion: 1,
        sendUpdates: 'none',
        requestBody: baseRequestBody,
      });
    } catch (err2) {
      const message2 = String(err2 || '');
      const conferenceBlocked =
        message2.includes('Invalid conference type value') ||
        message2.includes('conference') ||
        message2.includes('hangoutsMeet');

      if (!conferenceBlocked) {
        throw err2;
      }

      hasMeetLink = false;
      const { conferenceData, ...requestWithoutConference } = baseRequestBody as any;
      event = await calendar.events.insert({
        calendarId,
        sendUpdates: 'none',
        requestBody: requestWithoutConference,
      });
    }
  }

  let ownerEmailSent = false;
  let ownerEmailError: string | null = null;
  try {
    ownerEmailSent = await sendOwnerConfirmationEmail({
      ownerEmail,
      leadName: name,
      leadEmail: email,
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      meetLink: event.data.hangoutLink,
      eventLink: event.data.htmlLink,
    });
  } catch (err) {
    ownerEmailError = String(err);
    console.error('Owner booking email failed:', err);
  }

  return json({
    ok: true,
    booking: {
      eventId: event.data.id,
      htmlLink: event.data.htmlLink,
      meetLink: event.data.hangoutLink,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      invitedAttendee,
      hasMeetLink,
      ownerEmailSent,
      ownerEmailError,
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const action = String(body?.action || '').toLowerCase();

    if (action === 'slots') {
      return await handleSlots(body);
    }

    if (action === 'book') {
      return await handleBook(body);
    }

    return json({ error: 'Unsupported action. Use action="slots" or action="book".' }, 400);
  } catch (error) {
    return json({
      error: String(error),
    }, 400);
  }
});
