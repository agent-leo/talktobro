/**
 * TalkToBro Adaptive Timing
 *
 * Handles user timezone detection, night owl logic, and local time calculations.
 * All cron messages use the user's local time, not server time.
 */

// ─── Timezone Detection ───────────────────────────────────────────────────────

/**
 * Detect timezone from the browser (frontend only).
 */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Infer timezone from a phone number's country code.
 * Fallback heuristic — not precise but better than UTC.
 */
export function inferTimezoneFromPhone(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, '');

  const countryTimezones: Record<string, string> = {
    '+44':  'Europe/London',
    '+1':   'America/New_York',
    '+91':  'Asia/Kolkata',
    '+61':  'Australia/Sydney',
    '+49':  'Europe/Berlin',
    '+33':  'Europe/Paris',
    '+81':  'Asia/Tokyo',
    '+86':  'Asia/Shanghai',
    '+55':  'America/Sao_Paulo',
    '+234': 'Africa/Lagos',
    '+27':  'Africa/Johannesburg',
    '+971': 'Asia/Dubai',
    '+65':  'Asia/Singapore',
    '+852': 'Asia/Hong_Kong',
    '+353': 'Europe/Dublin',
  };

  // Try longest prefix first
  for (const [prefix, tz] of Object.entries(countryTimezones).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    if (cleaned.startsWith(prefix)) return tz;
  }

  return null;
}

// ─── Local Time Helpers ────────────────────────────────────────────────────────

/**
 * Get the current hour (0-23) in the user's timezone.
 */
export function getUserLocalHour(timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    return new Date().getUTCHours();
  }
}

/**
 * Get the full local time string for display.
 */
export function getUserLocalTime(timezone: string): string {
  try {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date().toISOString().slice(11, 16);
  }
}

// ─── Night Owl Handling ────────────────────────────────────────────────────────

export interface NightOwlConfig {
  quietStart: number;  // Hour to stop sending (default: 22)
  quietEnd: number;    // Hour to resume sending (default: 8)
}

const DEFAULT_QUIET_HOURS: NightOwlConfig = {
  quietStart: 22,
  quietEnd: 8,
};

/**
 * Check if it's currently quiet hours in the user's timezone.
 */
export function isQuietHours(
  timezone: string,
  config: NightOwlConfig = DEFAULT_QUIET_HOURS,
): boolean {
  const hour = getUserLocalHour(timezone);
  if (config.quietStart > config.quietEnd) {
    // Wraps midnight: e.g. 22-8
    return hour >= config.quietStart || hour < config.quietEnd;
  }
  return hour >= config.quietStart && hour < config.quietEnd;
}

/**
 * Calculate delay (in ms) until quiet hours end.
 * Returns 0 if not currently in quiet hours.
 */
export function msUntilQuietEnds(
  timezone: string,
  config: NightOwlConfig = DEFAULT_QUIET_HOURS,
): number {
  if (!isQuietHours(timezone, config)) return 0;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Parse current local time components
  const parts = formatter.formatToParts(now);
  const getValue = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  const localHour = getValue('hour');
  const localMinute = getValue('minute');

  // Hours until quiet ends
  let hoursUntil: number;
  if (localHour >= config.quietStart) {
    // After quietStart, wait until quietEnd next day
    hoursUntil = (24 - localHour) + config.quietEnd;
  } else {
    // Before quietEnd
    hoursUntil = config.quietEnd - localHour;
  }

  // Subtract current minutes
  const msUntil = (hoursUntil * 60 - localMinute) * 60 * 1000;
  return Math.max(0, msUntil);
}

// ─── Signup Timing ─────────────────────────────────────────────────────────────

/**
 * Determine if a user signed up late (after 8pm local time).
 * Late signups get adjusted cron timing — first messages go immediately,
 * but timed messages shift to avoid waking them at 3am.
 */
export function isLateSignup(timezone: string | null): boolean {
  if (!timezone) return false;
  const hour = getUserLocalHour(timezone);
  return hour >= 20 || hour < 6;
}

/**
 * Calculate the effective trial start for cron timing.
 * Late signups get their "morning" messages deferred to 8am.
 */
export function getEffectiveTrialStart(
  actualStart: Date,
  timezone: string | null,
): Date {
  if (!timezone || !isLateSignup(timezone)) return actualStart;

  // Push the effective start to 8am next morning
  const localHour = getUserLocalHour(timezone);
  let hoursToMorning: number;

  if (localHour >= 20) {
    hoursToMorning = (24 - localHour) + 8;
  } else {
    hoursToMorning = 8 - localHour;
  }

  return new Date(actualStart.getTime() + hoursToMorning * 60 * 60 * 1000);
}
