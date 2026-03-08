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

const TRIAL_DESC =
  '24-hour free trial. Full access to Bro via WhatsApp. Upgrade anytime to keep the conversation going.';
const STARTER_DESC = 'Starter plan — Try Bro properly. Great for first wins and getting momentum.';
const PRO_DESC = 'Pro plan — Your operational right hand. Advanced workflows, faster turnaround. £29/month after trial.';
const ELITE_DESC = 'Elite plan — Concierge Bro for serious builders. Bespoke strategy, playbooks, priority escalation.';
const TRIAL_PRODUCT_NAME = 'TalkToBro Trial';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const products = await stripe.products.list({ active: true, limit: 100 });

    const trial = products.data.find((p) => /trial/i.test(p.name) && /talk\s*to\s*bro|bro/i.test(p.name));
    const starter = products.data.find((p) => /starter/i.test(p.name) && /talk\s*to\s*bro|bro/i.test(p.name));
    const pro = products.data.find((p) => /pro/i.test(p.name) && /talk\s*to\s*bro|bro/i.test(p.name));
    const elite = products.data.find((p) => /elite/i.test(p.name) && /talk\s*to\s*bro|bro/i.test(p.name));

    const updates: Array<{ id: string; name: string; before: string | null; after: string }> = [];
    let trialCreated = false;

    if (!trial) {
      const createdTrial = await stripe.products.create({
        name: TRIAL_PRODUCT_NAME,
        description: TRIAL_DESC,
      });
      trialCreated = true;
      updates.push({ id: createdTrial.id, name: createdTrial.name, before: null, after: TRIAL_DESC });
    } else {
      const updated = await stripe.products.update(trial.id, { description: TRIAL_DESC });
      updates.push({ id: updated.id, name: updated.name, before: trial.description ?? null, after: TRIAL_DESC });
    }

    if (starter) {
      const updated = await stripe.products.update(starter.id, { description: STARTER_DESC });
      updates.push({ id: updated.id, name: updated.name, before: starter.description ?? null, after: STARTER_DESC });
    }

    if (pro) {
      const updated = await stripe.products.update(pro.id, { description: PRO_DESC });
      updates.push({ id: updated.id, name: updated.name, before: pro.description ?? null, after: PRO_DESC });
    }

    if (elite) {
      const updated = await stripe.products.update(elite.id, { description: ELITE_DESC });
      updates.push({ id: updated.id, name: updated.name, before: elite.description ?? null, after: ELITE_DESC });
    }

    const latestProducts = await stripe.products.list({ active: true, limit: 100 });

    return new Response(
      JSON.stringify({
        ok: true,
        found: latestProducts.data.map((p) => ({ id: p.id, name: p.name, description: p.description ?? null })),
        updated: updates,
        trialFound: !!trial,
        trialCreated,
        trialProductId: trial?.id ?? null,
        proFound: !!pro,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
