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
    const balance = await stripe.balance.retrieve();

    return new Response(
      JSON.stringify({
        ok: true,
        balance: {
          available: balance.available.map((b) => ({
            amount: b.amount,
            currency: b.currency,
            formatted: `${b.currency === 'gbp' ? '£' : '$'}${(b.amount / 100).toFixed(2)}`,
          })),
          pending: balance.pending.map((b) => ({
            amount: b.amount,
            currency: b.currency,
            formatted: `${b.currency === 'gbp' ? '£' : '$'}${(b.amount / 100).toFixed(2)}`,
          })),
          livemode: balance.livemode,
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