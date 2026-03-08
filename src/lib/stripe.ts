/**
 * TalkToBro Stripe Integration
 *
 * Handles trial → paid conversion flow:
 * - Create checkout sessions for trial users
 * - Process webhook events (payment success/failure)
 * - Update user state on subscription changes
 */

import { supabase } from './supabase';
import type { TrialContext } from './trialStateMachine';
import { transition } from './trialStateMachine';
import { trackPaymentSuccess, trackPaymentFailed, trackSubscriptionClicked } from './analytics';

// ─── Config ────────────────────────────────────────────────────────────────────

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const CHECKOUT_SUCCESS_URL = import.meta.env.VITE_APP_URL
  ? `${import.meta.env.VITE_APP_URL}/welcome`
  : 'https://talktobro.com/welcome';
const CHECKOUT_CANCEL_URL = import.meta.env.VITE_APP_URL
  ? `${import.meta.env.VITE_APP_URL}/trial`
  : 'https://talktobro.com/trial';

// Price IDs — set in env or use defaults
const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '';
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL || '';

export type SubscriptionPlan = 'monthly' | 'annual';

export interface CheckoutConfig {
  userId: string;
  plan: SubscriptionPlan;
  email?: string;
  trialContext?: TrialContext;
}

// ─── Checkout ──────────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout URL via the backend API.
 * The frontend redirects the user to this URL.
 */
export async function createCheckoutUrl(config: CheckoutConfig): Promise<string | null> {
  const { userId, plan, email } = config;

  trackSubscriptionClicked(userId, plan);

  try {
    // Call our backend edge function to create a Stripe session
    if (!supabase) {
      console.error('[stripe] Supabase not configured');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        userId,
        plan,
        email,
        priceId: plan === 'monthly' ? PRICE_MONTHLY : PRICE_ANNUAL,
        successUrl: `${CHECKOUT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: CHECKOUT_CANCEL_URL,
      },
    });

    if (error) {
      console.error('[stripe] Checkout creation failed:', error);
      return null;
    }

    return data?.url ?? null;
  } catch (err) {
    console.error('[stripe] Checkout error:', err);
    return null;
  }
}

/**
 * Redirect to Stripe Checkout. Call from a "Subscribe" button handler.
 */
export async function redirectToCheckout(config: CheckoutConfig): Promise<void> {
  const url = await createCheckoutUrl(config);
  if (url) {
    window.location.href = url;
  }
}

// ─── Pricing Display ──────────────────────────────────────────────────────────

export interface PricingInfo {
  monthly: { price: string; priceNumeric: number; interval: string };
  annual: { price: string; priceNumeric: number; interval: string; savings: string };
}

export const PRICING: PricingInfo = {
  monthly: {
    price: '£9',
    priceNumeric: 9,
    interval: 'month',
  },
  annual: {
    price: '£90',
    priceNumeric: 90,
    interval: 'year',
    savings: '2 months free',
  },
};

// ─── Webhook Handlers (Server-Side) ────────────────────────────────────────────
//
// These are meant for the Supabase Edge Function / API route that receives
// Stripe webhooks. Included here for reference — the actual webhook endpoint
// should import and call these.

/**
 * Handle `checkout.session.completed` webhook.
 */
export async function handleCheckoutCompleted(session: {
  customer: string;
  subscription: string;
  metadata?: { userId?: string };
  customer_email?: string;
}): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId || !supabase) return;

  // Update user record
  await supabase
    .from('users')
    .update({
      stripe_customer_id: session.customer,
      subscription_id: session.subscription,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Update trial state
  await supabase
    .from('trial_state')
    .update({
      state: 'SUBSCRIBED',
      subscribed_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  trackPaymentSuccess(userId, 'subscription', PRICING.monthly.priceNumeric);
}

/**
 * Handle `invoice.payment_failed` webhook.
 */
export async function handlePaymentFailed(invoice: {
  customer: string;
  subscription: string;
  metadata?: { userId?: string };
}): Promise<void> {
  const userId = invoice.metadata?.userId;
  if (!userId) return;

  trackPaymentFailed(userId, 'payment_declined');

  if (supabase) {
    await supabase
      .from('users')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }
}

/**
 * Handle `customer.subscription.deleted` webhook.
 */
export async function handleSubscriptionCancelled(subscription: {
  customer: string;
  metadata?: { userId?: string };
}): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId || !supabase) return;

  await supabase
    .from('users')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  await supabase
    .from('trial_state')
    .update({ state: 'CHURNED' })
    .eq('user_id', userId);
}

// ─── Trial Expiry Check ────────────────────────────────────────────────────────

/**
 * Check if a trial has expired and update state accordingly.
 * Call this from a scheduled job (e.g. every 5 minutes).
 */
export async function checkTrialExpiry(ctx: TrialContext): Promise<boolean> {
  const expiresAt = new Date(ctx.trialExpiresAt);
  if (new Date() < expiresAt) return false;
  if (ctx.state === 'SUBSCRIBED' || ctx.state === 'CHURNED') return false;

  const result = transition(ctx, 'TRIAL_EXPIRED');
  if (result.changed && supabase) {
    await supabase
      .from('trial_state')
      .update({
        state: result.newState,
        expired_at: new Date().toISOString(),
      })
      .eq('user_id', ctx.userId);
  }

  return result.changed;
}
