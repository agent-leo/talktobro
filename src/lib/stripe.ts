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
  ? `${import.meta.env.VITE_APP_URL}/pricing`
  : 'https://talktobro.com/pricing';

export type SubscriptionPlan = 'starter' | 'pro' | 'elite';
export type SubscriptionDuration = 1 | 3 | 6 | 12;

export interface CheckoutConfig {
  userId: string;
  plan: SubscriptionPlan;
  durationMonths: SubscriptionDuration;
  email?: string;
  trialContext?: TrialContext;
}

// ─── Checkout ──────────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout URL via the backend API.
 * The frontend redirects the user to this URL.
 */
export async function createCheckoutUrl(config: CheckoutConfig): Promise<string | null> {
  const { userId, plan, durationMonths, email } = config;

  trackSubscriptionClicked(userId, plan);

  try {
    // Call our backend edge function to create a Stripe session
    if (!supabase) {
      console.error('[stripe] Supabase not configured');
      return null;
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        user_id: userId,
        plan,
        duration_months: durationMonths,
        email,
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

export interface PlanPricing {
  monthly: number;
  label: string;
  description: string;
}

export interface PricingInfo {
  starter: PlanPricing;
  pro: PlanPricing;
  elite: PlanPricing;
  durations: Array<{ months: number; discount: number; label: string }>;
}

export const PRICING: PricingInfo = {
  starter: {
    monthly: 9,
    label: 'Starter',
    description: 'Talk to Bro',
  },
  pro: {
    monthly: 29,
    label: 'Pro 5x',
    description: '5x more usage than Starter',
  },
  elite: {
    monthly: 99,
    label: 'Pro 20x',
    description: '20x more usage than Starter',
  },
  durations: [
    { months: 1, discount: 0, label: '1 month' },
    { months: 3, discount: 0.1, label: '3 months' },
    { months: 6, discount: 0.15, label: '6 months' },
    { months: 12, discount: 0.25, label: '12 months' },
  ],
};

/**
 * Calculate the total price for a plan and duration.
 */
export function calculatePrice(plan: SubscriptionPlan, durationMonths: SubscriptionDuration): number {
  const monthly = PRICING[plan].monthly;
  const duration = PRICING.durations.find(d => d.months === durationMonths);
  const discount = duration?.discount ?? 0;
  return Math.round(monthly * durationMonths * (1 - discount) * 100) / 100;
}

/**
 * Calculate savings for a plan and duration.
 */
export function calculateSavings(plan: SubscriptionPlan, durationMonths: SubscriptionDuration): number {
  const monthly = PRICING[plan].monthly;
  const fullPrice = monthly * durationMonths;
  const discountedPrice = calculatePrice(plan, durationMonths);
  return Math.round((fullPrice - discountedPrice) * 100) / 100;
}

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
  metadata?: { userId?: string; plan?: string };
  customer_email?: string;
}): Promise<void> {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan || 'starter';
  if (!userId || !supabase) return;

  // Update user record
  await supabase
    .from('users')
    .update({
      stripe_customer_id: session.customer,
      subscription_id: session.subscription,
      subscription_status: 'active',
      subscription_plan: plan,
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

  const price = PRICING[plan as SubscriptionPlan]?.monthly ?? 9;
  trackPaymentSuccess(userId, 'subscription', price);
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