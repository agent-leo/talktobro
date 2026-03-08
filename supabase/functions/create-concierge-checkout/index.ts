import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_IDS: Record<string, string> = {
  starter_1: Deno.env.get('STRIPE_STARTER_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  starter_3: Deno.env.get('STRIPE_STARTER_3M_PRICE_ID') || Deno.env.get('STRIPE_STARTER_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  starter_6: Deno.env.get('STRIPE_STARTER_6M_PRICE_ID') || Deno.env.get('STRIPE_STARTER_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  starter_12: Deno.env.get('STRIPE_STARTER_12M_PRICE_ID') || Deno.env.get('STRIPE_STARTER_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  pro_1: Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  pro_3: Deno.env.get('STRIPE_PRO_3M_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  pro_6: Deno.env.get('STRIPE_PRO_6M_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  pro_12: Deno.env.get('STRIPE_PRO_12M_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  elite_1: Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  elite_3: Deno.env.get('STRIPE_ELITE_3M_PRICE_ID') || Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  elite_6: Deno.env.get('STRIPE_ELITE_6M_PRICE_ID') || Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
  elite_12: Deno.env.get('STRIPE_ELITE_12M_PRICE_ID') || Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e',
};
const SITE_URL = Deno.env.get('SITE_URL') || 'https://talktobro.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const name = String(body?.name || '').trim() || 'there';
    const phone = String(body?.phone || '').trim();
    const preferredChannel = String(body?.preferred_channel || 'whatsapp').toLowerCase();
    const goal = String(body?.goal || '').trim();
    const requestedPlan = String(body?.plan || 'starter').toLowerCase();
    const plan = ['starter', 'pro', 'elite'].includes(requestedPlan) ? requestedPlan : 'starter';
    const requestedDuration = Number(body?.duration_months || 1);
    const durationMonths = [1, 3, 6, 12].includes(requestedDuration) ? requestedDuration : 1;
    const priceKey = `${plan}_${durationMonths}`;
    const priceId = PRICE_IDS[priceKey] || PRICE_IDS[`${plan}_1`];
    const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

    if (!phone) {
      return new Response(JSON.stringify({ error: 'phone is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const successQuery = new URLSearchParams({
      session_id: '{CHECKOUT_SESSION_ID}',
      name,
      goal,
    }).toString();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/success?${successQuery}&plan=${encodeURIComponent(plan)}&duration_months=${durationMonths}`,
      cancel_url: `${SITE_URL}/pricing?plan=${encodeURIComponent(plan)}&duration_months=${durationMonths}`,
      subscription_data: {
        trial_period_days: 1,
      },
      custom_text: {
        submit: {
          message: `You're starting ${planLabel} (${durationMonths}-month billing), ${name}, with a 24-hour trial. Cancel before trial ends and you won't be charged.`,
        },
      },
      metadata: {
        source: 'whatsapp_concierge',
        name,
        phone,
        preferred_channel: preferredChannel,
        contact_value: phone,
        goal,
        plan,
        duration_months: String(durationMonths),
      },
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
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
