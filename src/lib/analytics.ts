/**
 * TalkToBro Analytics
 *
 * Tracks onboarding funnel events. Backend-agnostic — currently logs to
 * Supabase `analytics_events` table. Swap the sink without touching callers.
 */

import { supabase } from './supabase';
import type { TrialState } from './trialStateMachine';

// ─── Event Types ───────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  // Onboarding funnel
  | 'onboarding_started'
  | 'diagnostic_completed'
  | 'auth_initiated'
  | 'auth_success'
  | 'auth_failed'
  | 'first_win_delivered'
  | 'aha_moment_triggered'
  | 'conversion_shown'
  | 'subscription_clicked'
  | 'trial_expired'
  // State transitions
  | 'state_changed'
  // Engagement
  | 'message_sent'
  | 'message_received'
  | 'task_completed'
  | 'cross_platform_added'
  | 'memory_shared'
  | 'memory_recalled'
  // Payments
  | 'checkout_started'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_cancelled';

// ─── Event Payload ─────────────────────────────────────────────────────────────

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  userId: string;
  timestamp: string;
  properties?: Record<string, unknown>;
}

// ─── Core Tracking ─────────────────────────────────────────────────────────────

/**
 * Track an analytics event. Fire-and-forget — never blocks the user flow.
 */
export async function track(
  event: AnalyticsEvent,
  userId: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const payload: AnalyticsPayload = {
    event,
    userId,
    timestamp: new Date().toISOString(),
    properties,
  };

  // Console log in dev for debugging
  if (import.meta.env.DEV) {
    console.log('[analytics]', payload.event, payload.properties ?? '');
  }

  // Persist to Supabase
  if (supabase) {
    try {
      await supabase.from('analytics_events').insert({
        event: payload.event,
        user_id: payload.userId,
        timestamp: payload.timestamp,
        properties: payload.properties ?? {},
      });
    } catch (err) {
      // Analytics should never crash the app
      console.error('[analytics] Failed to persist event:', err);
    }
  }
}

// ─── Convenience Helpers ───────────────────────────────────────────────────────

export function trackOnboardingStarted(userId: string, channel: string) {
  return track('onboarding_started', userId, { channel });
}

export function trackDiagnosticCompleted(userId: string, winPath: string) {
  return track('diagnostic_completed', userId, { winPath });
}

export function trackAuthInitiated(userId: string, service: string) {
  return track('auth_initiated', userId, { service });
}

export function trackAuthSuccess(userId: string, service: string) {
  return track('auth_success', userId, { service });
}

export function trackAuthFailed(userId: string, service: string, error?: string) {
  return track('auth_failed', userId, { service, error });
}

export function trackFirstWin(userId: string, taskType: string) {
  return track('first_win_delivered', userId, { taskType });
}

export function trackAhaMoment(userId: string, trigger: 'proactivity' | 'memory_recall') {
  return track('aha_moment_triggered', userId, { trigger });
}

export function trackConversionShown(userId: string, hourIntoTrial: number) {
  return track('conversion_shown', userId, { hourIntoTrial });
}

export function trackSubscriptionClicked(userId: string, plan: 'monthly' | 'annual') {
  return track('subscription_clicked', userId, { plan });
}

export function trackTrialExpired(userId: string, finalState: TrialState, interactionCount: number) {
  return track('trial_expired', userId, { finalState, interactionCount });
}

export function trackStateChanged(
  userId: string,
  from: TrialState,
  to: TrialState,
  event: string,
) {
  return track('state_changed', userId, { from, to, triggerEvent: event });
}

export function trackPaymentSuccess(userId: string, plan: string, amount: number) {
  return track('payment_success', userId, { plan, amount });
}

export function trackPaymentFailed(userId: string, reason?: string) {
  return track('payment_failed', userId, { reason });
}
