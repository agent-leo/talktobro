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
    // Get all customers
    const customers = await stripe.customers.list({ limit: 20 });

    // Get all subscriptions
    const subscriptions = await stripe.subscriptions.list({ limit: 20, status: 'all' });

    // Get all payment intents
    const paymentIntents = await stripe.paymentIntents.list({ limit: 20 });

    return new Response(
      JSON.stringify({
        ok: true,
        customers: {
          total: customers.data.length,
          items: customers.data.map((c) => ({
            id: c.id,
            email: c.email,
            name: c.name,
            created: new Date(c.created * 1000).toISOString(),
          })),
        },
        subscriptions: {
          total: subscriptions.data.length,
          items: subscriptions.data.map((s) => ({
            id: s.id,
            status: s.status,
            customer: s.customer,
            current_period_start: new Date(s.current_period_start * 1000).toISOString(),
            current_period_end: new Date(s.current_period_end * 1000).toISOString(),
            plan: s.plan?.id || null,
            items: s.items.data.map((i) => ({
              price: i.price?.id,
              quantity: i.quantity,
            })),
          })),
        },
        payment_intents: {
          total: paymentIntents.data.length,
          items: paymentIntents.data.map((pi) => ({
            id: pi.id,
            status: pi.status,
            amount: pi.amount,
            currency: pi.currency,
            customer: pi.customer,
            created: new Date(pi.created * 1000).toISOString(),
            last_payment_error: pi.last_payment_error?.message || null,
          })),
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