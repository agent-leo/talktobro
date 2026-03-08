import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') || '';
const TELEGRAM_ONBOARDING_TOPIC_ID = Deno.env.get('TELEGRAM_ONBOARDING_TOPIC_ID') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function telegramApi(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json?.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(json)}`);
  }
  return json?.result;
}

async function ensureOnboardingTopicId() {
  if (TELEGRAM_ONBOARDING_TOPIC_ID) return Number(TELEGRAM_ONBOARDING_TOPIC_ID);
  const topic = await telegramApi('createForumTopic', {
    chat_id: TELEGRAM_CHAT_ID,
    name: 'Onboarding Submitted',
  });
  return Number(topic?.message_thread_id || 0);
}

async function sendTelegram(text: string, opts?: { onboardingEvent?: boolean }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
  }

  let message_thread_id: number | undefined;
  if (opts?.onboardingEvent) {
    try {
      message_thread_id = await ensureOnboardingTopicId();
    } catch (_err) {
      // If chat is not a forum group or topic creation fails, fall back to normal chat delivery.
      message_thread_id = undefined;
    }
  }

  await telegramApi('sendMessage', {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    disable_web_page_preview: true,
    ...(message_thread_id ? { message_thread_id } : {}),
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const eventType = String(body?.event_type || 'event');
    const payload = body?.payload || {};

    if (eventType === 'setup_onboarding_topic') {
      const topicId = await ensureOnboardingTopicId();
      return new Response(JSON.stringify({ ok: true, topic_id: topicId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const text = [
      `🔔 TalkToBro ${eventType}`,
      payload?.name ? `Name: ${payload.name}` : null,
      payload?.channel ? `Channel: ${payload.channel}` : null,
      payload?.contact ? `Contact: ${payload.contact}` : null,
      payload?.status ? `Status: ${payload.status}` : null,
      payload?.amount ? `Amount: ${payload.amount}` : null,
      payload?.time ? `Time: ${payload.time}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    await sendTelegram(text, { onboardingEvent: eventType === 'onboarding_submitted' });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
