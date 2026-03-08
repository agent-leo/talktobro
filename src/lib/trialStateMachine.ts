/**
 * TalkToBro Trial State Machine
 *
 * States track a user's journey through the 24-hour trial.
 * Transitions are deterministic — each event maps to exactly one next state.
 */

// ─── Core States ───────────────────────────────────────────────────────────────

export type TrialState =
  | 'INIT'           // QR scanned / link opened, no interaction yet
  | 'DIAGNOSTIC'     // User described their pain point
  | 'CONNECTING'     // Auth flow in progress (calendar/email/etc.)
  | 'FIRST_WIN'      // First real task completed
  | 'ENGAGED'        // 2+ interactions, using Bro actively
  | 'AHA_MOMENT'     // User experienced proactivity or memory recall
  | 'CONVERTING'     // Shown pricing, considering subscription
  | 'SUBSCRIBED'     // Paid. Full access.
  | 'CHURNED'        // Trial expired without conversion
  // Edge states
  | 'GHOST'          // No response after initial message
  | 'PAUSED'         // User said "later" or went quiet mid-trial
  | 'AUTH_FAIL'      // Calendar/email auth failed
  | 'EMPTY_STATE';   // Connected but no data (empty calendar, etc.)

// ─── Events ────────────────────────────────────────────────────────────────────

export type TrialEvent =
  | 'QR_SCANNED'
  | 'USER_RESPONDED'
  | 'AUTH_STARTED'
  | 'AUTH_SUCCEEDED'
  | 'AUTH_FAILED'
  | 'AUTH_RETRIED'
  | 'FIRST_TASK_DONE'
  | 'DATA_EMPTY'
  | 'INTERACTION_THRESHOLD'   // 3+ interactions
  | 'PROACTIVITY_SHOWN'
  | 'MEMORY_RECALLED'
  | 'CONVERSION_SHOWN'
  | 'CHECKOUT_CLICKED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'TRIAL_EXPIRED'
  | 'NO_RESPONSE_2H'
  | 'NO_RESPONSE_4H'
  | 'USER_SAID_LATER'
  | 'USER_RETURNED'
  | 'REACTIVATED';

// ─── Transition Table ──────────────────────────────────────────────────────────

const transitions: Record<TrialState, Partial<Record<TrialEvent, TrialState>>> = {
  INIT: {
    USER_RESPONDED:       'DIAGNOSTIC',
    NO_RESPONSE_2H:       'INIT',         // gentle nudge, stay in INIT
    NO_RESPONSE_4H:       'GHOST',
    USER_SAID_LATER:      'PAUSED',
  },
  DIAGNOSTIC: {
    AUTH_STARTED:          'CONNECTING',
    FIRST_TASK_DONE:      'FIRST_WIN',    // skipped auth (e.g. reminder)
    USER_SAID_LATER:      'PAUSED',
    NO_RESPONSE_4H:       'GHOST',
  },
  CONNECTING: {
    AUTH_SUCCEEDED:        'FIRST_WIN',
    AUTH_FAILED:           'AUTH_FAIL',
    DATA_EMPTY:            'EMPTY_STATE',
  },
  FIRST_WIN: {
    INTERACTION_THRESHOLD: 'ENGAGED',
    PROACTIVITY_SHOWN:     'AHA_MOMENT',
    MEMORY_RECALLED:       'AHA_MOMENT',
    CONVERSION_SHOWN:      'CONVERTING',
    NO_RESPONSE_4H:        'GHOST',
    TRIAL_EXPIRED:         'CHURNED',
  },
  ENGAGED: {
    PROACTIVITY_SHOWN:     'AHA_MOMENT',
    MEMORY_RECALLED:       'AHA_MOMENT',
    CONVERSION_SHOWN:      'CONVERTING',
    TRIAL_EXPIRED:         'CHURNED',
  },
  AHA_MOMENT: {
    CONVERSION_SHOWN:      'CONVERTING',
    TRIAL_EXPIRED:         'CHURNED',
  },
  CONVERTING: {
    CHECKOUT_CLICKED:      'CONVERTING',   // stay until payment resolves
    PAYMENT_SUCCESS:       'SUBSCRIBED',
    PAYMENT_FAILED:        'CONVERTING',   // can retry
    TRIAL_EXPIRED:         'CHURNED',
  },
  SUBSCRIBED: {
    // Terminal state — no transitions out
  },
  CHURNED: {
    REACTIVATED:           'INIT',         // user comes back
  },

  // Edge states
  GHOST: {
    USER_RETURNED:         'DIAGNOSTIC',
    TRIAL_EXPIRED:         'CHURNED',
    REACTIVATED:           'INIT',
  },
  PAUSED: {
    USER_RETURNED:         'DIAGNOSTIC',
    NO_RESPONSE_4H:        'GHOST',
    TRIAL_EXPIRED:         'CHURNED',
  },
  AUTH_FAIL: {
    AUTH_RETRIED:          'CONNECTING',
    FIRST_TASK_DONE:       'FIRST_WIN',    // bypassed auth, did a reminder
    USER_SAID_LATER:       'PAUSED',
    NO_RESPONSE_4H:        'GHOST',
    TRIAL_EXPIRED:         'CHURNED',
  },
  EMPTY_STATE: {
    FIRST_TASK_DONE:       'FIRST_WIN',    // set a test reminder
    USER_SAID_LATER:       'PAUSED',
    TRIAL_EXPIRED:         'CHURNED',
  },
};

// ─── State Machine ─────────────────────────────────────────────────────────────

export interface TrialContext {
  userId: string;
  state: TrialState;
  interactionCount: number;
  tasksCompleted: string[];
  personalDetails: Record<string, string>;  // e.g. { wifeName: 'Sarah' }
  connectedServices: string[];              // e.g. ['calendar', 'email']
  timezone: string | null;
  trialStartedAt: string;                   // ISO timestamp
  trialExpiresAt: string;                   // ISO timestamp
  lastActiveAt: string;                     // ISO timestamp
  engagementLevel: 'high' | 'medium' | 'low';
  conversionShownAt: string | null;
  minutesSaved: number;
}

export function createTrialContext(userId: string, timezone?: string): TrialContext {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    userId,
    state: 'INIT',
    interactionCount: 0,
    tasksCompleted: [],
    personalDetails: {},
    connectedServices: [],
    timezone: timezone ?? null,
    trialStartedAt: now.toISOString(),
    trialExpiresAt: expiresAt.toISOString(),
    lastActiveAt: now.toISOString(),
    engagementLevel: 'low',
    conversionShownAt: null,
    minutesSaved: 0,
  };
}

export interface TransitionResult {
  newState: TrialState;
  changed: boolean;
  previousState: TrialState;
}

/**
 * Attempt a state transition. Returns new state + whether it changed.
 * Does NOT mutate context — caller is responsible for persisting.
 */
export function transition(
  context: TrialContext,
  event: TrialEvent,
): TransitionResult {
  const currentState = context.state;
  const stateTransitions = transitions[currentState];
  const nextState = stateTransitions?.[event];

  if (!nextState) {
    // No valid transition — stay in current state
    return { newState: currentState, changed: false, previousState: currentState };
  }

  return { newState: nextState, changed: true, previousState: currentState };
}

/**
 * Compute engagement level from interaction count and tasks completed.
 */
export function computeEngagement(context: TrialContext): 'high' | 'medium' | 'low' {
  const { interactionCount, tasksCompleted } = context;

  if (interactionCount >= 5 && tasksCompleted.length >= 2) return 'high';
  if (interactionCount >= 2 || tasksCompleted.length >= 1) return 'medium';
  return 'low';
}

/**
 * Check if trial has expired.
 */
export function isTrialExpired(context: TrialContext): boolean {
  return new Date() >= new Date(context.trialExpiresAt);
}

/**
 * Hours elapsed since trial started.
 */
export function hoursIntoTrial(context: TrialContext): number {
  const start = new Date(context.trialStartedAt).getTime();
  return (Date.now() - start) / (1000 * 60 * 60);
}

/**
 * Hours since last user activity.
 */
export function hoursSinceActive(context: TrialContext): number {
  const last = new Date(context.lastActiveAt).getTime();
  return (Date.now() - last) / (1000 * 60 * 60);
}

/**
 * All valid events for a given state (useful for UI/debugging).
 */
export function validEvents(state: TrialState): TrialEvent[] {
  return Object.keys(transitions[state] || {}) as TrialEvent[];
}
