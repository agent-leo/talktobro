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

// The webhook endpoint URL for TalkToBro
const WEBHOOK_URL = 'https://chnxribjzydidlvafqfj.supabase.co/functions/v1/stripe-webhook';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Get all webhooks
    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

    // Find our webhook
    const existingWebhook = webhooks.data.find(w => w.url === WEBHOOK_URL);

    // Events we want to receive
    const requiredEvents = [
      'checkout.session.completed',
      'charge.succeeded',
      'charge.failed',
      'charge.refunded',
      'charge.dispute.created',
      'invoice.payment_failed',
      'customer.subscription.deleted',
    ];

    let result;

    if (existingWebhook) {
      // Update existing webhook
      result = await stripe.webhookEndpoints.update(existingWebhook.id, {
        enabled_events: requiredEvents,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          action: 'updated',
          webhook: {
            id: result.id,
            url: result.url,
            status: result.status,
            enabled_events: result.enabled_events,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    } else {
      // Create new webhook
      // Note: This requires the webhook secret to be provided
      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

      if (!webhookSecret) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'No STRIPE_WEBHOOK_SECRET found. Create webhook manually in Stripe Dashboard.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      result = await stripe.webhookEndpoints.create({
        url: WEBHOOK_URL,
        enabled_events: requiredEvents,
      });

      return new Response(
        JSON.stringify({
          ok: true,
          action: 'created',
          webhook: {
            id: result.id,
            url: result.url,
            status: result.status,
            enabled_events: result.enabled_events,
            secret: 'Webhook secret should be set in Stripe Dashboard',
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});