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
    const plans = [
      { key: 'starter', name: 'TalkToBro Starter', monthlyAmount: 900, desc: 'Starter plan — Try Bro properly' },
      { key: 'pro', name: 'TalkToBro Pro', monthlyAmount: 2900, desc: 'Pro plan — Your operational right hand' },
      { key: 'elite', name: 'TalkToBro Elite', monthlyAmount: 9900, desc: 'Elite plan — Concierge Bro for serious builders' },
    ] as const;

    const durations = [
      { months: 1, discount: 0 },
      { months: 3, discount: 0.1 },
      { months: 6, discount: 0.15 },
      { months: 12, discount: 0.25 },
    ] as const;

    const created: Record<string, { productId: string; priceId: string; unitAmount: number }> = {};

    for (const plan of plans) {
      let product = (await stripe.products.list({ active: true, limit: 100 })).data.find((p) => p.name === plan.name);
      if (!product) {
        product = await stripe.products.create({ name: plan.name, description: plan.desc });
      }

      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });

      for (const d of durations) {
        const totalAmount = Math.round(plan.monthlyAmount * d.months * (1 - d.discount));
        let price = prices.data.find(
          (p) =>
            p.currency === 'gbp' &&
            p.recurring?.interval === 'month' &&
            p.recurring?.interval_count === d.months &&
            p.unit_amount === totalAmount,
        );

        if (!price) {
          price = await stripe.prices.create({
            product: product.id,
            currency: 'gbp',
            unit_amount: totalAmount,
            recurring: { interval: 'month', interval_count: d.months },
          });
        }

        created[`${plan.key}_${d.months}`] = { productId: product.id, priceId: price.id, unitAmount: totalAmount };
      }
    }

    return new Response(JSON.stringify({ ok: true, created }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
