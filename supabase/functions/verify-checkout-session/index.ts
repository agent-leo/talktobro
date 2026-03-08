import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function supabaseRpc(fnName: string, payload: Record<string, unknown>) {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase RPC ${fnName} failed: ${txt}`);
  }

  return res.json();
}

async function notifyOwner(text: string) {
  if (!telegramBotToken || !telegramChatId) return;
  await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramChatId, text }),
  });
}

function asUuidOrNull(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const sessionId = String(body?.session_id || '').trim();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid = session.status === 'complete' && (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');
    if (!paid) {
      return new Response(JSON.stringify({ ok: true, paid: false, status: session.status, payment_status: session.payment_status }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userIdRaw = (session.metadata?.user_id || session.client_reference_id || null) as string | null;
    const userId = asUuidOrNull(userIdRaw);
    const preferredChannel = (session.metadata?.preferred_channel || 'whatsapp') as string;
    const phone = (session.metadata?.phone || null) as string | null;
    const telegramHandle = (session.metadata?.telegram_handle || null) as string | null;
    const contactValue = (session.metadata?.contact_value || phone || null) as string | null;

    await supabaseRpc('activate_trial_onboarding', {
      p_request_id: `stripe-${session.id}`,
      p_user_id: userId,
      p_name: (session.metadata?.name || null) as string | null,
      p_phone: phone,
      p_preferred_channel: preferredChannel,
      p_telegram_handle: telegramHandle,
      p_telegram_user_id: preferredChannel === 'telegram' ? contactValue : null,
      p_goals: (session.metadata?.goal || null) as string | null,
      p_experience: null,
      p_style: null,
      p_checkout_url: `https://talktobro.com/success?session_id=${session.id}`,
      p_message_limit: 20,
      p_trial_hours: 24,
    });

    await notifyOwner([
      '✅ Checkout verified on success page',
      `session: ${session.id}`,
      `channel: ${preferredChannel}`,
      `contact: ${contactValue || 'unknown'}`,
      `status: ${session.payment_status}`,
      `time: ${new Date().toISOString()}`,
    ].join('\n'));

    return new Response(JSON.stringify({ ok: true, paid: true, activated: true }), {
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
