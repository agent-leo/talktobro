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

function formatAmount(amount: number | null, currency: string = 'gbp'): string {
  if (amount === null || amount === undefined) return 'unknown';
  const symbol = currency === 'gbp' ? '£' : currency === 'usd' ? '$' : `${currency.toUpperCase()} `;
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

serve(async (req) => {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return new Response('Missing stripe-signature', { status: 400 });

    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    // ─── Checkout Session Completed ─────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userIdRaw = (session.metadata?.user_id || session.client_reference_id || null) as string | null;
      const userId = asUuidOrNull(userIdRaw);
      const preferredChannel = (session.metadata?.preferred_channel || 'whatsapp') as string;
      const phone = (session.metadata?.phone || null) as string | null;
      const telegramHandle = (session.metadata?.telegram_handle || null) as string | null;
      const plan = ((session.metadata?.plan || 'starter') as string).toLowerCase();
      const contactValue = (session.metadata?.contact_value || phone || null) as string | null;

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
        '✅ New checkout completed',
        `👤 Name: ${session.metadata?.name || 'unknown'}`,
        `📧 Email: ${session.customer_email || session.customer_details?.email || 'unknown'}`,
        `📱 Contact: ${contactValue || 'unknown'}`,
        `📦 Plan: ${plan}`,
        `💬 Channel: ${preferredChannel}`,
        `🆔 Session: ${session.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Charge Succeeded (Actual Payment) ───────────────────────────────────────
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;

      await notifyOwner([
        '💰 Payment successful',
        `💵 Amount: ${formatAmount(charge.amount, charge.currency)}`,
        `📧 Email: ${charge.billing_details?.email || 'unknown'}`,
        `👤 Customer: ${charge.customer || 'unknown'}`,
        `🆔 Charge: ${charge.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Charge Failed (Card Declined) ───────────────────────────────────────────
    if (event.type === 'charge.failed') {
      const charge = event.data.object as Stripe.Charge;

      await notifyOwner([
        '❌ Payment failed (card declined)',
        `💵 Amount: ${formatAmount(charge.amount, charge.currency)}`,
        `📧 Email: ${charge.billing_details?.email || 'unknown'}`,
        `👤 Customer: ${charge.customer || 'unknown'}`,
        `🚫 Reason: ${charge.failure_message || 'unknown'}`,
        `🆔 Charge: ${charge.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Charge Refunded ────────────────────────────────────────────────────────
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const refundAmount = charge.amount_refunded;

      await notifyOwner([
        '💸 Charge refunded',
        `💵 Amount: ${formatAmount(refundAmount, charge.currency)}`,
        `📧 Email: ${charge.billing_details?.email || 'unknown'}`,
        `👤 Customer: ${charge.customer || 'unknown'}`,
        `🆔 Charge: ${charge.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Dispute Created (Chargeback) ────────────────────────────────────────────
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object as Stripe.Dispute;

      await notifyOwner([
        '⚠️ DISPUTE CREATED (Chargeback)',
        `💵 Amount: ${formatAmount(dispute.amount, dispute.currency)}`,
        `📧 Reason: ${dispute.reason || 'unknown'}`,
        `🆔 Dispute: ${dispute.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
        `⚠️ ACTION REQUIRED: Check Stripe Dashboard`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Invoice Payment Failed ───────────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await notifyOwner([
        '❌ Invoice payment failed',
        `💵 Amount: ${formatAmount(invoice.amount_due, invoice.currency)}`,
        `📧 Customer: ${customerId}`,
        `🔁 Attempts: ${invoice.attempt_count}`,
        `📋 Invoice: ${invoice.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // ─── Subscription Deleted ────────────────────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

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
            status: 'cancelled',
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          });
        }
      }

      await notifyOwner([
        '🚫 Subscription cancelled',
        `👤 Customer: ${customerId}`,
        `📋 Subscription: ${sub.id}`,
        `⏰ Time: ${new Date().toISOString()}`,
      ].join('\n'));

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ignored: true, event_type: event.type }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 400 });
  }
});