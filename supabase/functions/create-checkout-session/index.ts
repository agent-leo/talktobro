import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const PRICE_ID = Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || 'price_1T6quyKD33EoksC8Z8MJte2e';
const SITE_URL = Deno.env.get('SITE_URL') || 'https://talktobro.com';

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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing`,
      subscription_data: {
        trial_period_days: 1,
      },
      custom_text: {
        submit: {
          message:
            'Starts with a 24-hour trial. You can cancel before trial end and won’t be charged.',
        },
      },
      metadata: {
        user_id: userId,
        name,
        preferred_channel: preferredChannel,
        phone,
        telegram_handle: telegramHandle,
        contact_value: contactValue,
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
