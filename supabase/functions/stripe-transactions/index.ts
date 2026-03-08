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
    // Get recent refunds
    const refunds = await stripe.refunds.list({ limit: 20 });

    // Get recent disputes
    const disputes = await stripe.disputes.list({ limit: 20 });

    // Get balance transactions
    const balanceTransactions = await stripe.balanceTransactions.list({ limit: 20 });

    // Get successful charges
    const charges = await stripe.charges.list({ limit: 20 });

    return new Response(
      JSON.stringify({
        ok: true,
        refunds: {
          total: refunds.data.length,
          items: refunds.data.map((r) => ({
            id: r.id,
            amount: r.amount,
            currency: r.currency,
            status: r.status,
            reason: r.reason,
            created: new Date(r.created * 1000).toISOString(),
          })),
        },
        disputes: {
          total: disputes.data.length,
          items: disputes.data.map((d) => ({
            id: d.id,
            amount: d.amount,
            currency: d.currency,
            status: d.status,
            reason: d.reason,
            created: new Date(d.created * 1000).toISOString(),
          })),
        },
        balance_transactions: {
          total: balanceTransactions.data.length,
          items: balanceTransactions.data.map((t) => ({
            id: t.id,
            amount: t.amount,
            currency: t.currency,
            type: t.type,
            status: t.status,
            description: t.description,
            created: new Date(t.created * 1000).toISOString(),
          })),
        },
        successful_charges: {
          total: charges.data.filter((c) => c.paid && !c.refunded).length,
          items: charges.data
            .filter((c) => c.paid && !c.refunded)
            .map((c) => ({
              id: c.id,
              amount: c.amount,
              currency: c.currency,
              status: c.status,
              paid: c.paid,
              refunded: c.refunded,
              created: new Date(c.created * 1000).toISOString(),
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