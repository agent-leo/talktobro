/**
 * TalkToBro Onboarding Message Templates
 *
 * All 9 messages from the ironclad onboarding flow, plus edge case handlers.
 * Templates use {{placeholders}} for dynamic content.
 */

import type { TrialContext } from '../lib/trialStateMachine';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface OnboardingMessage {
  id: string;
  label: string;
  triggerHour: number | null;    // null = event-triggered, not time-based
  template: string;
  condition?: (ctx: TrialContext) => boolean;
}

// ─── Message 1: The Hook (0-30 seconds) ────────────────────────────────────────

export const MSG_HOOK: OnboardingMessage = {
  id: 'hook',
  label: 'The Hook',
  triggerHour: 0,
  template: `Hey, I'm Bro. 👋

I handle the boring stuff — scheduling, emails, reminders, all of it.

What's the thing you keep putting off? Just tell me in your own words.`,
};

export const MSG_HOOK_NUDGE: OnboardingMessage = {
  id: 'hook_nudge',
  label: 'The Hook — 2h Nudge',
  triggerHour: 2,
  template: `Still there? If you're busy, I can wait. Or just say "later" and I'll check in tomorrow.`,
  condition: (ctx) => ctx.state === 'INIT' && ctx.interactionCount === 0,
};

// ─── Message 2: The Win (1-5 minutes) ──────────────────────────────────────────

export const MSG_WIN_CALENDAR: OnboardingMessage = {
  id: 'win_calendar',
  label: 'The Win — Calendar',
  triggerHour: null,
  template: `Got it — scheduling is a pain. Let me connect your calendar.

[Connect Calendar]

✅ Connected. Here's what's ahead:
{{calendarSummary}}

Want me to remind you before any of these?`,
};

export const MSG_WIN_EMAIL: OnboardingMessage = {
  id: 'win_email',
  label: 'The Win — Email',
  triggerHour: null,
  template: `Got it — inbox overload. Let me connect your email.

[Connect Email]

✅ Connected. Here's what needs attention:
{{emailSummary}}

Want me to draft replies to any of these?`,
};

export const MSG_WIN_REMINDERS: OnboardingMessage = {
  id: 'win_reminders',
  label: 'The Win — Reminders',
  triggerHour: null,
  template: `Got it — forgetting stuff is the worst. Let's fix that.

What's the first thing you want me to remind you about? Give me the thing and the time.`,
};

export const MSG_WIN_CLARIFY: OnboardingMessage = {
  id: 'win_clarify',
  label: 'The Win — Clarify',
  triggerHour: null,
  template: `Sounds like you've got a lot going on. Let me narrow it down:

What's the ONE thing that, if I handled it right now, would make your day easier?`,
};

// ─── Message 3: The Tease (Hour 1-2) ──────────────────────────────────────────

export const MSG_TEASE: OnboardingMessage = {
  id: 'tease',
  label: 'The Tease — Cross-Platform',
  triggerHour: 1,
  template: `That's one thing off your plate.

By the way — I can do this across WhatsApp, Telegram, even Discord. Same me, everywhere.

Want a link to add me somewhere else? Or should we get through your list first?`,
  condition: (ctx) =>
    ['FIRST_WIN', 'ENGAGED'].includes(ctx.state) && ctx.tasksCompleted.length >= 1,
};

export const MSG_TEASE_CONFIRM: OnboardingMessage = {
  id: 'tease_confirm',
  label: 'The Tease — Platform Added',
  triggerHour: null,
  template: `Same Bro, new chat. I'll remember everything from here.`,
};

// ─── Message 4: The Memory (Hour 2-4) ─────────────────────────────────────────

export const MSG_MEMORY_ASK: OnboardingMessage = {
  id: 'memory_ask',
  label: 'The Memory — Ask',
  triggerHour: 2,
  template: `Quick question: what's something you want me to remember about you?

Your partner's name, your biggest goal, how you take your coffee — whatever.

I'm building a memory. The more you tell me, the more useful I become.`,
  condition: (ctx) =>
    ['FIRST_WIN', 'ENGAGED'].includes(ctx.state) &&
    Object.keys(ctx.personalDetails).length === 0,
};

export const MSG_MEMORY_RECALL: OnboardingMessage = {
  id: 'memory_recall',
  label: 'The Memory — Recall',
  triggerHour: 4,
  template: `By the way — how's {{personalDetailValue}}? You mentioned {{personalDetailSubject}} earlier.`,
  condition: (ctx) => Object.keys(ctx.personalDetails).length > 0,
};

// ─── Message 5: The Proactivity (Hour 4-8) ─────────────────────────────────────

export const MSG_PROACTIVITY_CALENDAR: OnboardingMessage = {
  id: 'proactivity_calendar',
  label: 'The Proactivity — Calendar',
  triggerHour: 4,
  template: `Heads up — you have that call with {{eventContact}} in 30 minutes.

Want me to prep you with their last email thread? Or just remind you 5 mins before?`,
  condition: (ctx) => ctx.connectedServices.includes('calendar'),
};

export const MSG_PROACTIVITY_FALLBACK: OnboardingMessage = {
  id: 'proactivity_fallback',
  label: 'The Proactivity — Fallback',
  triggerHour: 6,
  template: `Saw it's been quiet for a few hours. Want me to check your inbox for anything urgent? Or set a reminder for something tomorrow?`,
  condition: (ctx) => !ctx.connectedServices.includes('calendar'),
};

// ─── Hour 8-12: Midpoint Check ─────────────────────────────────────────────────

export const MSG_MIDPOINT_HIGH: OnboardingMessage = {
  id: 'midpoint_high',
  label: 'Midpoint — High Engagement',
  triggerHour: 8,
  template: `Here's what we've done:

{{taskSummary}}

This is what having me around feels like. Want to keep going?

**£9/month** — less than two coffees.

[Continue with Bro →]`,
  condition: (ctx) => ctx.engagementLevel === 'high',
};

export const MSG_MIDPOINT_MEDIUM: OnboardingMessage = {
  id: 'midpoint_medium',
  label: 'Midpoint — Medium Engagement',
  triggerHour: 10,
  template: `We've knocked out {{lastTask}}. That's one thing off your plate.

Try:
- "What's on my calendar this week?"
- "Remind me to {{suggestedTask}} at {{suggestedTime}}"
- "Draft a message to {{suggestedContact}}"`,
  condition: (ctx) => ctx.engagementLevel === 'medium',
};

export const MSG_MIDPOINT_LOW: OnboardingMessage = {
  id: 'midpoint_low',
  label: 'Midpoint — Low Engagement',
  triggerHour: 12,
  template: `I'm here whenever you're ready. No rush.

Say "show me" and I'll demo something useful.`,
  condition: (ctx) => ctx.engagementLevel === 'low',
};

// ─── Hour 20: Conversion Push ──────────────────────────────────────────────────

export const MSG_CONVERSION: OnboardingMessage = {
  id: 'conversion',
  label: 'Conversion Push',
  triggerHour: 20,
  template: `Your trial ends in **4 hours**.

In the last 20 hours, you've:
- Completed {{taskCount}} tasks
- Saved ~{{minutesSaved}} minutes

**What you lose if I pause:**
- Morning briefings
- Proactive reminders
- Cross-platform memory
- Priority responses

**£9/month** (or £90/year — 2 months free)

[Tap to continue →]

Questions? Just ask.`,
};

// ─── Hour 23.5: Final Push ─────────────────────────────────────────────────────

export const MSG_FINAL: OnboardingMessage = {
  id: 'final',
  label: 'Final Push',
  triggerHour: 23.5,
  template: `Last call. Trial ends in **30 minutes**.

[Tap to continue →]

Or do nothing and I'll pause. You can reactivate anytime.`,
};

// ─── Edge Case Handlers ────────────────────────────────────────────────────────

export const MSG_GHOST_REENGAGEMENT: OnboardingMessage = {
  id: 'ghost_reengagement',
  label: 'Ghost — Re-engagement',
  triggerHour: 24,
  template: `Your trial ended. Want to try again? Just say "restart" and I'll reset the clock.`,
  condition: (ctx) => ctx.state === 'GHOST' || ctx.state === 'CHURNED',
};

export const MSG_SKEPTIC: OnboardingMessage = {
  id: 'skeptic',
  label: 'Skeptic Response',
  triggerHour: null,
  template: `Yep, I'm AI. But here's the thing — I can actually *do* things, not just chat. Want to see?`,
};

export const MSG_OVERSHARER: OnboardingMessage = {
  id: 'oversharer',
  label: 'Over-Sharer Redirect',
  triggerHour: null,
  template: `That's a lot — let me focus on what will help most right now. What's the one thing you need handled today?`,
};

export const MSG_EMPTY_STATE: OnboardingMessage = {
  id: 'empty_state',
  label: 'Empty State',
  triggerHour: null,
  template: `You're connected! Your calendar's quiet right now — that's fine.

When things pick up, I'll be here. Want to set a test reminder?`,
};

export const MSG_TECH_FAILURE: OnboardingMessage = {
  id: 'tech_failure',
  label: 'Technical Failure',
  triggerHour: null,
  template: `Hit a snag on my end. Should be resolved in a few minutes. Your trial time is paused — you won't lose anything.`,
};

// ─── Bigger Than Bro Plant (Hour 4-8) ──────────────────────────────────────────

export const MSG_UPSELL_PLANT: OnboardingMessage = {
  id: 'upsell_plant',
  label: 'Bigger Than Bro — Consulting Plant',
  triggerHour: 6,
  template: `Need something bigger than this? I can help you set up your own OpenClaw agent — custom build for your workflow, your stack, your life.

Just mentioning. Let's get through your list first.`,
  condition: (ctx) => ctx.engagementLevel === 'high',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * All messages in chronological send order.
 */
export const ALL_MESSAGES: OnboardingMessage[] = [
  MSG_HOOK,
  MSG_HOOK_NUDGE,
  MSG_WIN_CALENDAR,
  MSG_WIN_EMAIL,
  MSG_WIN_REMINDERS,
  MSG_WIN_CLARIFY,
  MSG_TEASE,
  MSG_TEASE_CONFIRM,
  MSG_MEMORY_ASK,
  MSG_MEMORY_RECALL,
  MSG_PROACTIVITY_CALENDAR,
  MSG_PROACTIVITY_FALLBACK,
  MSG_MIDPOINT_HIGH,
  MSG_MIDPOINT_MEDIUM,
  MSG_MIDPOINT_LOW,
  MSG_CONVERSION,
  MSG_FINAL,
  MSG_GHOST_REENGAGEMENT,
  MSG_SKEPTIC,
  MSG_OVERSHARER,
  MSG_EMPTY_STATE,
  MSG_TECH_FAILURE,
  MSG_UPSELL_PLANT,
];

/**
 * Get time-triggered messages due for a given hour offset into the trial.
 */
export function getMessagesForHour(
  hour: number,
  ctx: TrialContext,
): OnboardingMessage[] {
  return ALL_MESSAGES.filter((msg) => {
    if (msg.triggerHour === null) return false;
    if (msg.triggerHour > hour) return false;
    // Allow ±0.5h window for cron drift
    if (Math.abs(msg.triggerHour - hour) > 0.5) return false;
    if (msg.condition && !msg.condition(ctx)) return false;
    return true;
  });
}

/**
 * Interpolate {{placeholders}} in a template with values.
 */
export function renderMessage(
  msg: OnboardingMessage,
  values: Record<string, string>,
): string {
  return msg.template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `[${key}]`);
}

/**
 * Detect user intent from their first message to route to the right "Win" path.
 */
export type WinPath = 'calendar' | 'email' | 'reminders' | 'clarify';

export function detectWinPath(userMessage: string): WinPath {
  const lower = userMessage.toLowerCase();

  const calendarKeywords = ['calendar', 'meeting', 'meetings', 'schedule', 'scheduling', 'calls', 'forgetting calls', 'appointments'];
  const emailKeywords = ['email', 'emails', 'inbox', 'overwhelmed', 'mail'];
  const reminderKeywords = ['reminder', 'reminders', 'task', 'tasks', 'forget', 'forgetting', 'to-do', 'todo'];

  if (calendarKeywords.some((k) => lower.includes(k))) return 'calendar';
  if (emailKeywords.some((k) => lower.includes(k))) return 'email';
  if (reminderKeywords.some((k) => lower.includes(k))) return 'reminders';
  return 'clarify';
}

/**
 * Get the right "Win" message based on detected path.
 */
export function getWinMessage(path: WinPath): OnboardingMessage {
  switch (path) {
    case 'calendar':  return MSG_WIN_CALENDAR;
    case 'email':     return MSG_WIN_EMAIL;
    case 'reminders': return MSG_WIN_REMINDERS;
    case 'clarify':   return MSG_WIN_CLARIFY;
  }
}
