/**
 * TalkToBro Trial Cron Jobs
 *
 * Scheduled touch points during the 24-hour trial.
 * Each cron checks user state and sends the appropriate message
 * at the right time in the user's local timezone.
 */

import type { TrialContext } from './trialStateMachine';
import {
  hoursIntoTrial,
  hoursSinceActive,
  computeEngagement,
  isTrialExpired,
  transition,
} from './trialStateMachine';
import {
  MSG_HOOK_NUDGE,
  MSG_TEASE,
  MSG_MEMORY_ASK,
  MSG_MEMORY_RECALL,
  MSG_PROACTIVITY_CALENDAR,
  MSG_PROACTIVITY_FALLBACK,
  MSG_MIDPOINT_HIGH,
  MSG_MIDPOINT_MEDIUM,
  MSG_MIDPOINT_LOW,
  MSG_CONVERSION,
  MSG_FINAL,
  MSG_UPSELL_PLANT,
  MSG_GHOST_REENGAGEMENT,
  renderMessage,
  type OnboardingMessage,
} from '../data/onboardingMessages';
import { getUserLocalHour } from './adaptiveTiming';
import {
  trackConversionShown,
  trackTrialExpired,
  trackAhaMoment,
} from './analytics';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CronJob {
  id: string;
  label: string;
  triggerHour: number;         // Hours into trial when this fires
  execute: (ctx: TrialContext) => CronResult | null;
}

export interface CronResult {
  message: string;
  messageId: string;
  stateEvent?: string;         // TrialEvent to fire after sending
  analyticsEvent?: string;
}

// ─── Night Owl Guard ───────────────────────────────────────────────────────────

/**
 * Don't send messages between 22:00-08:00 user local time.
 * Returns true if it's safe to send.
 */
function isSendableHour(ctx: TrialContext): boolean {
  if (!ctx.timezone) return true;  // No timezone = send anyway
  const localHour = getUserLocalHour(ctx.timezone);
  return localHour >= 8 && localHour < 22;
}

// ─── Cron Definitions ──────────────────────────────────────────────────────────

/**
 * Hour 2: Hook nudge (if no response)
 */
const cronHookNudge: CronJob = {
  id: 'hook_nudge',
  label: 'Hook Nudge',
  triggerHour: 2,
  execute: (ctx) => {
    if (ctx.state !== 'INIT' || ctx.interactionCount > 0) return null;
    if (!isSendableHour(ctx)) return null;

    return {
      message: MSG_HOOK_NUDGE.template,
      messageId: MSG_HOOK_NUDGE.id,
    };
  },
};

/**
 * Hour 4: Cross-platform seed + ghost detection
 */
const cronCrossPlatform: CronJob = {
  id: 'cross_platform',
  label: 'Cross-Platform Seed',
  triggerHour: 4,
  execute: (ctx) => {
    if (!isSendableHour(ctx)) return null;

    // Ghost detection
    if (hoursSinceActive(ctx) >= 4 && ctx.interactionCount <= 1) {
      return {
        message: MSG_HOOK_NUDGE.template,
        messageId: 'ghost_check',
        stateEvent: 'NO_RESPONSE_4H',
      };
    }

    // Memory ask if engaged but no personal details
    if (['FIRST_WIN', 'ENGAGED'].includes(ctx.state) &&
        Object.keys(ctx.personalDetails).length === 0) {
      return {
        message: MSG_MEMORY_ASK.template,
        messageId: MSG_MEMORY_ASK.id,
      };
    }

    // Cross-platform tease
    if (MSG_TEASE.condition?.(ctx)) {
      return {
        message: MSG_TEASE.template,
        messageId: MSG_TEASE.id,
      };
    }

    return null;
  },
};

/**
 * Hour 8: Proactivity moment
 */
const cronProactivity: CronJob = {
  id: 'proactivity',
  label: 'Proactivity Moment',
  triggerHour: 8,
  execute: (ctx) => {
    if (!isSendableHour(ctx)) return null;
    if (['GHOST', 'PAUSED', 'CHURNED', 'SUBSCRIBED'].includes(ctx.state)) return null;

    // Memory recall if we have personal details
    if (Object.keys(ctx.personalDetails).length > 0 && MSG_MEMORY_RECALL.condition?.(ctx)) {
      const firstKey = Object.keys(ctx.personalDetails)[0];
      const firstValue = ctx.personalDetails[firstKey];
      return {
        message: renderMessage(MSG_MEMORY_RECALL, {
          personalDetailValue: firstValue,
          personalDetailSubject: firstKey,
        }),
        messageId: MSG_MEMORY_RECALL.id,
        stateEvent: 'MEMORY_RECALLED',
        analyticsEvent: 'aha_moment_triggered',
      };
    }

    // Proactive calendar nudge
    if (MSG_PROACTIVITY_CALENDAR.condition?.(ctx)) {
      return {
        message: renderMessage(MSG_PROACTIVITY_CALENDAR, {
          eventContact: '[next meeting contact]',
        }),
        messageId: MSG_PROACTIVITY_CALENDAR.id,
        stateEvent: 'PROACTIVITY_SHOWN',
        analyticsEvent: 'aha_moment_triggered',
      };
    }

    // Fallback proactivity
    if (MSG_PROACTIVITY_FALLBACK.condition?.(ctx)) {
      return {
        message: MSG_PROACTIVITY_FALLBACK.template,
        messageId: MSG_PROACTIVITY_FALLBACK.id,
        stateEvent: 'PROACTIVITY_SHOWN',
      };
    }

    // Upsell plant for high engagement
    if (MSG_UPSELL_PLANT.condition?.(ctx)) {
      return {
        message: MSG_UPSELL_PLANT.template,
        messageId: MSG_UPSELL_PLANT.id,
      };
    }

    return null;
  },
};

/**
 * Hour 12: Midpoint engagement check
 */
const cronMidpoint: CronJob = {
  id: 'midpoint',
  label: 'Midpoint Check',
  triggerHour: 12,
  execute: (ctx) => {
    if (!isSendableHour(ctx)) return null;
    if (['GHOST', 'PAUSED', 'CHURNED', 'SUBSCRIBED', 'CONVERTING'].includes(ctx.state)) return null;

    const engagement = computeEngagement(ctx);
    let msg: OnboardingMessage;
    const values: Record<string, string> = {};

    switch (engagement) {
      case 'high':
        msg = MSG_MIDPOINT_HIGH;
        values.taskSummary = ctx.tasksCompleted
          .map((t) => `✅ ${t}`)
          .join('\n');
        break;
      case 'medium':
        msg = MSG_MIDPOINT_MEDIUM;
        values.lastTask = ctx.tasksCompleted[ctx.tasksCompleted.length - 1] ?? 'your first task';
        values.suggestedTask = 'call the dentist';
        values.suggestedTime = '9am tomorrow';
        values.suggestedContact = 'your team';
        break;
      default:
        msg = MSG_MIDPOINT_LOW;
        break;
    }

    return {
      message: renderMessage(msg, values),
      messageId: msg.id,
      stateEvent: engagement === 'high' ? 'CONVERSION_SHOWN' : undefined,
      analyticsEvent: engagement === 'high' ? 'conversion_shown' : undefined,
    };
  },
};

/**
 * Hour 20: Conversion push
 */
const cronConversion: CronJob = {
  id: 'conversion',
  label: 'Conversion Push',
  triggerHour: 20,
  execute: (ctx) => {
    if (!isSendableHour(ctx)) return null;
    if (['GHOST', 'CHURNED', 'SUBSCRIBED'].includes(ctx.state)) return null;

    return {
      message: renderMessage(MSG_CONVERSION, {
        taskCount: String(ctx.tasksCompleted.length),
        minutesSaved: String(ctx.minutesSaved || Math.max(ctx.tasksCompleted.length * 5, 10)),
      }),
      messageId: MSG_CONVERSION.id,
      stateEvent: 'CONVERSION_SHOWN',
      analyticsEvent: 'conversion_shown',
    };
  },
};

/**
 * Hour 23.5: Final push
 */
const cronFinal: CronJob = {
  id: 'final',
  label: 'Final Push',
  triggerHour: 23.5,
  execute: (ctx) => {
    if (['SUBSCRIBED', 'CHURNED'].includes(ctx.state)) return null;

    return {
      message: MSG_FINAL.template,
      messageId: MSG_FINAL.id,
    };
  },
};

/**
 * Hour 24+: Trial expiry
 */
const cronExpiry: CronJob = {
  id: 'expiry',
  label: 'Trial Expired',
  triggerHour: 24,
  execute: (ctx) => {
    if (ctx.state === 'SUBSCRIBED') return null;
    if (!isTrialExpired(ctx)) return null;

    return {
      message: MSG_GHOST_REENGAGEMENT.template,
      messageId: MSG_GHOST_REENGAGEMENT.id,
      stateEvent: 'TRIAL_EXPIRED',
      analyticsEvent: 'trial_expired',
    };
  },
};

// ─── Registry ──────────────────────────────────────────────────────────────────

export const TRIAL_CRONS: CronJob[] = [
  cronHookNudge,
  cronCrossPlatform,
  cronProactivity,
  cronMidpoint,
  cronConversion,
  cronFinal,
  cronExpiry,
];

/**
 * Get all cron jobs that should fire now for a given trial context.
 * Call this from a scheduler (e.g. every 15 minutes for all active trials).
 */
export function getDueCrons(ctx: TrialContext): CronResult[] {
  const hours = hoursIntoTrial(ctx);
  const results: CronResult[] = [];

  for (const cron of TRIAL_CRONS) {
    // Check if we're within the trigger window (±0.5h)
    if (hours < cron.triggerHour - 0.25) continue;
    if (hours > cron.triggerHour + 0.5) continue;

    const result = cron.execute(ctx);
    if (result) {
      results.push(result);
    }
  }

  return results;
}
