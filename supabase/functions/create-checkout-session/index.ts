import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get('SITE_URL') || 'https://talktobro.com';

// Price IDs from Stripe (created by stripe-create-ladder-prices)
const PRICE_IDS: Record<string, Record<number, string>> = {
  starter: {
    1: 'price_1T86sZKD33EoksC8wKWJI8hQ',
    3: 'price_1T87zdKD33EoksC8KAS18eQm',
    6: 'price_1T87zdKD33EoksC8jF9yO6Y6',
    12: 'price_1T87zdKD33EoksC8SO4njmBW',
  },
  pro: {
    1: 'price_1T86saKD33EoksC8zSMPwDjR',
    3: 'price_1T87zeKD33EoksC8bsOBXN88',
    6: 'price_1T87zeKD33EoksC8oxHDcMRX',
    12: 'price_1T87zfKD33EoksC8qD0c3M0Z',
  },
  elite: {
    1: 'price_1T86sbKD33EoksC83z6kkzwv',
    3: 'price_1T87zfKD33EoksC8kkOEdnM0',
    6: 'price_1T87zfKD33EoksC8pWdgiZec',
    12: 'price_1T87zgKD33EoksC80qyWBR4Z',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body = await req.json();
    const userId = body?.user_id || '';
    const name = body?.name || '';
    const preferredChannel = (body?.preferred_channel || 'whatsapp').toLowerCase();
    const phone = body?.phone || '';
    const telegramHandle = body?.telegram_handle || '';
    const contactValue = body?.contact_value || phone || telegramHandle || '';
    const plan = (body?.plan || 'starter').toLowerCase();
    const durationMonths = body?.duration_months || 1;

    // Validate plan
    const validPlans = ['starter', 'pro', 'elite'];
    if (!validPlans.includes(plan)) {
      return new Response(JSON.stringify({ error: `Invalid plan: ${plan}. Valid plans: ${validPlans.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Validate duration
    const validDurations = [1, 3, 6, 12];
    if (!validDurations.includes(durationMonths)) {
      return new Response(JSON.stringify({ error: `Invalid duration: ${durationMonths}. Valid durations: ${validDurations.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const priceId = PRICE_IDS[plan]?.[durationMonths];
    if (!priceId) {
      return new Response(JSON.stringify({ error: `No price found for plan=${plan}, duration=${durationMonths}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing`,
      subscription_data: {
        trial_period_days: 1,
      },
      custom_text: {
        submit: {
          message:
            "Starts with a 24-hour trial. You can cancel before trial end and won't be charged.",
        },
      },
      metadata: {
        user_id: userId,
        name,
        preferred_channel: preferredChannel,
        phone,
        telegram_handle: telegramHandle,
        contact_value: contactValue,
        plan,
        duration_months: String(durationMonths),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});