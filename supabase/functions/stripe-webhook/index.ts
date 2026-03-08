import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID') || '';

async function supabaseUpsert(table: string, payload: Record<string, unknown>) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase ${table} upsert failed: ${txt}`);
  }

  return res.json();
}

async function notifyOwner(text: string) {
  if (!telegramBotToken || !telegramChatId) return;

  await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      disable_web_page_preview: true,
    }),
  });
}

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

function asUuidOrNull(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : null;
}

serve(async (req) => {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return new Response('Missing stripe-signature', { status: 400 });

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userIdRaw = (session.metadata?.user_id || session.client_reference_id || null) as string | null;
      const userId = asUuidOrNull(userIdRaw);
      const preferredChannel = (session.metadata?.preferred_channel || 'whatsapp') as string;
      const phone = (session.metadata?.phone || null) as string | null;
      const telegramHandle = (session.metadata?.telegram_handle || null) as string | null;
      const plan = ((session.metadata?.plan || 'starter') as string).toLowerCase();
      const contactValue = (session.metadata?.contact_value || phone || null) as string | null;

      // Stripe is now the source of truth for trial activation.
      await supabaseRpc('activate_trial_onboarding', {
        p_request_id: `stripe-${session.id}`,
        p_user_id: userId,
        p_name: (session.metadata?.name || null) as string | null,
        p_phone: phone,
        p_preferred_channel: preferredChannel,
        p_telegram_handle: telegramHandle,
        p_telegram_user_id: preferredChannel === 'telegram' ? contactValue : null,
        p_goals: null,
        p_experience: null,
        p_style: null,
        p_checkout_url: `https://talktobro.com/success?session_id=${session.id}`,
        p_message_limit: 20,
        p_trial_hours: 24,
      });

      if (userId) {
        await supabaseUpsert('subscriptions', {
          user_id: userId,
          plan,
          status: 'active',
          stripe_customer_id: session.customer,
          stripe_checkout_session_id: session.id,
          updated_at: new Date().toISOString(),
        });
      }

      await notifyOwner([
        '💳 New payment / trial checkout completed',
        `user_id: ${userId || userIdRaw || 'unknown'}`,
        `plan: ${plan}`,
        `channel: ${preferredChannel}`,
        `contact: ${contactValue || 'unknown'}`,
        `session: ${session.id}`,
        `time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
      const sub = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId = 'customer' in sub ? String(sub.customer || '') : '';
      if (customerId) {
        const res = await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_customer_id=eq.${encodeURIComponent(customerId)}`, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
        if (res.ok) {
          const rows = await res.json();
          if (rows?.[0]?.user_id) {
            await supabaseUpsert('subscriptions', {
              user_id: rows[0].user_id,
              plan: rows[0].plan || 'starter',
              status: 'inactive',
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      await notifyOwner([
        `⚠️ Stripe event: ${event.type}`,
        `customer: ${customerId || 'unknown'}`,
        `time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ignored: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 400 });
  }
});
