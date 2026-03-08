import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Get recent checkout sessions (last 7 days)
    const checkoutSessions = await stripe.checkout.sessions.list({
      limit: 50,
      created: { gte: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 },
    });

    // Get recent payment intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 50,
      created: { gte: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 },
    });

    // Get recent charges (includes failed)
    const charges = await stripe.charges.list({
      limit: 50,
      created: { gte: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 },
    });

    // Get recent invoices
    const invoices = await stripe.invoices.list({
      limit: 50,
      created: { gte: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60 },
    });

    // Format checkout sessions
    const formattedSessions = checkoutSessions.data.map((s) => ({
      id: s.id,
      status: s.status,
      payment_status: s.payment_status,
      customer_email: s.customer_email || s.customer_details?.email || null,
      amount_total: s.amount_total ? `£${(s.amount_total / 100).toFixed(2)}` : null,
      currency: s.currency,
      metadata: s.metadata,
      created: new Date(s.created * 1000).toISOString(),
      url: s.url,
    }));

    // Format payment intents
    const formattedIntents = paymentIntents.data.map((pi) => ({
      id: pi.id,
      status: pi.status,
      amount: `£${(pi.amount / 100).toFixed(2)}`,
      currency: pi.currency,
      created: new Date(pi.created * 1000).toISOString(),
      last_payment_error: pi.last_payment_error?.message || null,
    }));

    // Format charges (includes failed)
    const formattedCharges = charges.data.map((c) => ({
      id: c.id,
      status: c.status,
      amount: `£${(c.amount / 100).toFixed(2)}`,
      currency: c.currency,
      created: new Date(c.created * 1000).toISOString(),
      failure_message: c.failure_message,
      failure_code: c.failure_code,
      paid: c.paid,
      refunded: c.refunded,
    }));

    // Format invoices
    const formattedInvoices = invoices.data.map((inv) => ({
      id: inv.id,
      status: inv.status,
      amount_paid: inv.amount_paid ? `£${(inv.amount_paid / 100).toFixed(2)}` : null,
      attempt_count: inv.attempt_count,
      next_payment_attempt: inv.next_payment_attempt ? new Date(inv.next_payment_attempt * 1000).toISOString() : null,
      created: new Date(inv.created * 1000).toISOString(),
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        checkout_sessions: {
          total: formattedSessions.length,
          items: formattedSessions,
        },
        payment_intents: {
          total: formattedIntents.length,
          items: formattedIntents,
        },
        charges: {
          total: formattedCharges.length,
          items: formattedCharges,
        },
        invoices: {
          total: formattedInvoices.length,
          items: formattedInvoices,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});