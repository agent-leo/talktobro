# TalkToBro 24-Hour Trial Onboarding Flow — Ironclad Edition

## Philosophy

The trial is an interview. In 24 hours, Bro must prove it's indispensable. Not features — outcomes. Not chat — action.

**Core principle:** Engineer the "aha moment." Track it. Amplify it. Convert on the back of it.

---

## State Machine

```
INIT → DIAGNOSTIC → CONNECTING → FIRST_WIN → ENGAGED → AHA_MOMENT → CONVERTING → [SUBSCRIBED|CHURNED]
  ↓        ↓           ↓           ↓          ↓         ↓            ↓
GHOST   FALLBACK    AUTH_FAIL   EMPTY_STATE  LOW_USE  SKIP        PAUSED
```

**Timeout rules:**
- `INIT→GHOST`: 2 hours without response
- `DIAGNOSTIC→FALLBACK`: 30 minutes without pain point identification
- `CONNECTING→AUTH_FAIL`: 5 minutes if OAuth errors
- `FIRST_WIN→EMPTY_STATE`: If no data exists (empty calendar/inbox)
- `ENGAGED→LOW_USE`: <3 interactions by hour 12

---

## Analytics Events (Track Everything)

| Event | Trigger | Priority |
|-------|---------|----------|
| `onboarding_started` | QR scan / link opened | Required |
| `diagnostic_completed` | Pain point identified | Required |
| `auth_initiated` | User clicks connect | Required |
| `auth_success` | OAuth callback received | Required |
| `auth_failed` | OAuth error/timeout | Required |
| `first_win_delivered` | Data/action shown | Required |
| `aha_moment_triggered` | User positive sentiment detected | Critical |
| `conversion_shown` | Pricing presented | Required |
| `subscription_clicked` | CTA tapped | Critical |
| `trial_expired` | 24h elapsed | Required |

---

## The First 5 Minutes (Critical)

### Message 1: Diagnostic Welcome (Seconds 0-30)

**Trigger:** User scans QR code or opens WhatsApp link

**Bro sends immediately:**

> Hey, I'm Bro. 👋
> 
> I'm an AI that handles the boring stuff — scheduling, emails, reminders, all of it.
> 
> Quick question: what's the thing you keep putting off or forgetting? Just tell me in your own words.

**Why this works:**
- Open-ended, not multiple choice (reduces friction)
- User describes their pain in their own language (psychological ownership)
- Bro listens first, acts second (builds trust)
- No technical setup required to respond

**Edge case — The Ghost:**
- If no response after 2 hours → Send: "Still there? If you're busy, I can wait. Or just say 'later' and I'll check in tomorrow."
- If still no response after 4 hours → Mark as `GHOST`. Add to re-engagement drip (24h, 72h).

---

### Message 2: The Perfect First Win (Minutes 1-5)

**Trigger:** User describes their need (or says "calendar/email/reminders")

**Parse intent:**
- "Calendar" / "meetings" / "schedule" / "forgetting calls" → Calendar path
- "Email" / "inbox" / "overwhelmed" / "too many messages" → Email path
- "Reminders" / "tasks" / "to-do" / "forget stuff" → Reminders path
- Vague/unclear → Clarification message

**Calendar Path:**

> Got it — scheduling is a pain. Let me connect your calendar.
> 
> [Auth button: Connect Google/Outlook Calendar]
> 
> Once you're in, I'll show you what's coming up and handle the annoying bits.

**Email Path:**

> Inbox chaos. I get it. Let me see what we're dealing with.
> 
> [Auth button: Connect Gmail/Outlook]
> 
> I'll scan for what's actually urgent and draft replies to the stuff you can knock out quickly.

**Reminders Path:**

> Forgotten tasks. The worst. I can fix that.
> 
> What's one thing you need to do in the next 24 hours? Tell me and I'll make sure it happens.

**Edge case — The Skeptic:**
- If user asks "are you AI?" / "is this a bot?" → 
> "Yep, I'm AI. But here's the thing — I can actually *do* things, not just chat. I can access your calendar, draft emails, set reminders. Want to see what that looks like?"

**Edge case — The Over-Sharer:**
- If user dumps >100 words → 
> "That's a lot — let me focus on what will help most right now. What's the one thing you need handled today?"

---

### Message 2b: First Win Delivered (Post-Auth, Minutes 3-10)

**Trigger:** OAuth success callback

**If Calendar (with data):**

> You're connected! Here's what's ahead:
> 
> **Today:** [Event 1], [Event 2], [Event 3]
> **Tomorrow:** [Event 4]
> 
> Want me to remind you before any of these? Or I can prep you with context before a specific one.

**If Calendar (empty):**
> You're connected! Your calendar looks quiet right now — that's fine. 
> 
> When things pick up, I'll be here. Want to set a reminder to test me out?

**If Email (with data):**

> Inbox connected. Here's what I see:
> 
> - **[Urgent]** [Sender] about [topic] (2h ago)
> - **[FYI]** [Sender] [topic] (5h ago)
> - **[Noise]** [Sender] — looks like a newsletter
> 
> Want me to draft a reply to the urgent one? Or summarize the FYI?

**If Email (empty/inbox zero):**
> Inbox connected. You're at inbox zero — impressive.
> 
> When emails come in, I'll be watching. Want to see how I handle reminders instead?

**If Reminders (user gave task):**

> Got it: "[Task]" — locked in. I'll remind you [time].
> 
> That's one thing off your mental load. What else is taking up space in your head right now?

**Why this works:**
- Immediate proof of connection
- Shows actual user data (builds trust)
- Offers specific next action
- Empty states handled gracefully (no embarrassment)

**Analytics:** Fire `first_win_delivered` event.

---

### Message 3: The Aha Moment Trigger (Minutes 5-15, CONDITIONAL)

**Trigger:** User responds positively to first win ("thanks", "nice", "that's helpful", "wow", "cool", any emoji)

**Bro sends immediately:**

> That's exactly what I'm here for.
> 
> Here's the thing — you just experienced the free trial. But imagine this: every day, I do this proactively. Morning briefings. End-of-day recaps. I remember everything you tell me. I work across WhatsApp, Telegram, wherever you message me.
> 
> That's the full version. That's what £9/month gets you.
> 
> Want to keep going after today?

**Why this works:**
- Strikes while the iron is hot (immediate gratification)
- Positions the aha: "You just felt it. Here's how to keep it."
- Early pricing exposure while value is fresh
- Natural CTA

**Analytics:** Fire `aha_moment_triggered` and `conversion_shown` events.

**Edge case — No positive response:**
- Skip this message. Proceed to Message 4.

---

## The First Hour (Building Dependency)

### Message 4: The Teaching Moment (Minutes 30-60)

**Trigger:** Time-based, OR if user hasn't engaged since first win

**Bro sends:**

> Quick question: what's something you want me to remember about you?
> 
> Could be your partner's name, your biggest goal, how you take your coffee, whatever.
> 
> I'm building a memory — and the more you tell me, the more useful I become.

**Why this works:**
- Asks user to invest in the relationship (commitment consistency)
- Demonstrates memory capability
- Creates future conversation hooks
- Investment psychology: users who share personal info are more likely to subscribe

**Edge case — Low Engagement User (Hour 12):**
- If <3 interactions by hour 12:
> "Just checking in — is there anything specific you'd like me to handle? Or are you more of a 'see how it goes' person? No wrong answer."

---

### Message 5: Cross-Platform Setup (Hour 2-4, Optional)

**Trigger:** User has completed first win + has been active

**Bro sends:**

> By the way — I work wherever you message me.
> 
> Right now we're on [WhatsApp/Telegram]. But I can also jump into your other chats. Same memory, same capabilities.
> 
> Want me to send you a link to add me elsewhere? Or stick with this for now?

**Why this works:**
- Introduces breadth after depth is established
- Optional (user can decline without friction)
- Creates multi-channel lock-in

**Edge case — Already Multi-Platform:**
- If user adds Bro to second platform during trial, sync state and acknowledge: "Same Bro, new chat. I remember everything from our other conversation."

---

---

### Message 5: Memory Demonstration (Hour 1-2)

**Trigger:** If user shared personal info earlier (partner's name, goals, etc.)

**Bro sends:**

> Quick reminder: You mentioned earlier that you wanted to [goal/task].
> 
> How's that going? Want me to help with next steps?
> 
> (Just showing you I actually remember things — this is what makes me different from ChatGPT.)

**Why this works:**
- Proves memory works
- References specific conversation
- Positions Bro vs. competitors
- Follows up on stated goals

---

## Hours 3-12: Sustained Value

### Message 6: Conditional Activity Summary (Hour 8-12, Adaptive)

**Trigger:** Time-based, but message content depends on engagement level

**High Engagement (5+ interactions, 2+ tasks completed):**

> Here's what we've done so far:
> 
> ✅ [Task 1]
> ✅ [Task 2]
> ✅ [Task 3]
> 
> **Coming up:**
> - [Event/reminder]
> 
> This is what having me around feels like. Want me to keep going?
> 
> [CTA: Continue after trial — £9/month]

**Medium Engagement (2-4 interactions, 1 task completed):**

> We've knocked out [task]. That's one thing off your plate.
> 
> Want to see what else I can handle? Try:
> - "What's on my calendar tomorrow?"
> - "Remind me to [thing] at [time]"
> - "Draft a message to [person]"

**Low Engagement (0-1 interactions, no tasks):**

> I'm here whenever you're ready. No rush.
> 
> If you want to see what I'm capable of, just say "show me" and I'll demo something useful.

**Why this works:**
- Acknowledges actual engagement (no fake "we")
- High engagement → early conversion push (strike while hot)
- Medium engagement → nudge toward more interaction
- Low engagement → remove pressure, invite exploration

**Edge case — Night Owl signup:**
- If user signed up after 8pm, skip this message. Send at appropriate "end of their day" instead.
- Adaptive timing: Use user's first message timestamp + 8 hours as "day end."

---

## Hour 18-24: The Conversion Push

### Message 7: Trial Ending Notice (Hour 20)

**Trigger:** All active trials

**Bro sends:**

> Your trial ends in **4 hours**.
> 
> In the last 20 hours, you've:
> - Completed [X] tasks
> - Saved ~[Y] minutes of mental overhead
> 
> **What full access includes:**
> - No time limits — I'm here whenever you need me
> - Proactive briefings — I reach out, not just respond
> - Extended memory — everything you tell me, forever
> - Priority responses — even during busy periods
> 
> **£9/month. Or £90/year (2 months free).**
> 
> Tap to continue: [Stripe checkout link]
> 
> Questions? Just ask.

**Why this works:**
- Scarcity (4 hours left) creates urgency
- Specific usage stats (proves value, prevents "I didn't use it")
- Annual option introduces higher value anchor
- Single CTA (tap to continue) — default bias
- Open door for objections/questions

**Analytics:** Fire `conversion_shown` event.

---

### Message 8: Final Push — Default Bias (Hour 23.5)

**Trigger:** All non-converted trials

**Bro sends:**

> Last call. Trial ends in **30 minutes**.
> 
> Tap here to continue: [link]
> 
> —
> 
> Or, do nothing and I'll pause quietly. You can reactivate anytime, but I'll lose our conversation history.
> 
> Thanks for trying me out. I hope I helped, even a little. 🙏

**Why this works:**
- "Tap here to continue" is the primary CTA (default bias)
- "Do nothing and I'll pause" — passive opt-out, not active cancellation
- Loss aversion (conversation history) without desperation
- Gratitude, not pressure
- Leaves positive final impression (re-activation path)

**Edge case — Payment Failure:**
- If user taps CTA but payment fails:
> "Looks like something went wrong with the payment. Common with new subscriptions. Want to try again, or shall I hold your spot for 24 hours while you sort it?"

**Edge case — The Returner:**
- If user has had previous trial:
> "Welcome back. I remember you from [date] — want to pick up where we left off?"

---

## Edge Cases & Failure States

### Authentication Failures

**Calendar/Email auth fails:**
> "Hit a snag connecting your [calendar/email]. Could be permissions or a timeout.
> 
> Want to try again, or skip this and try reminders instead?"

**Multiple auth failures (2+):**
> "Seems like there might be an issue with permissions. Common with work accounts that have extra security.
> 
> You can still use me without connecting anything — just tell me what you need and I'll handle it manually. Or if you have a personal account, that usually works smoother."

### The "Stop" Command

**User says "stop" / "unsubscribe" / "pause":**
> "Got it. I'll pause all messages. 
> 
> Your trial is still active for [X] more hours. Just message me anytime to resume."

- Mark user as `PAUSED`
- Stop all cron messages
- Trial continues in background
- User can resume with any message

### Group Chat During Trial

**User adds Bro to a group:**
> "Hey — I'm Bro, [User]'s AI assistant. I help with scheduling, reminders, etc.
> 
> Just so you know, I'm currently in [User]'s trial period. I'll help here, but I'm optimised for 1:1 conversations.
> 
> [User] — want me to focus here or keep your personal chat as primary?"

### Technical Failures

**Service outage during trial:**
> "Heads up — I'm experiencing some technical issues on my end. Should be resolved in a few minutes.
> 
> Your trial time is paused during the outage. You won't lose anything."

- Pause trial timer during outages
- Resume when service restores
- Log as `service_degradation` event

---

## The Cron Jobs (Automated Touches)

Beyond manual messages, Bro should have automated touches:

1. **Morning Briefing (8am)** — If user has calendar connected
   > Good morning! Here's your day:
   > - 3 events
   > - 2 tasks due
   > - Weather: [brief]
   > 
   > Want the full breakdown?

2. **Evening Recap (8pm)** — Summary of what was accomplished
   > Here's what we did today: [list]
   > Tomorrow: [preview]
   > 
   > Anything else before you head to bed?

3. **Mid-Trial Nudge (Hour 12)** — If engagement is low
   > Just checking in — is there anything specific you'd like me to help with? I can do a lot more than chat:
   > - Clear your inbox
   > - Schedule meetings
   > - Set up recurring reminders
   > - Research something for you

---

## The Cron Jobs (Automated Touches)

**Adaptive Timing Rule:**
- All cron jobs are timezone-aware
- "Morning" = user's 8am (not system time)
- "Evening" = user's first message time + 8 hours (if signed up after 6pm)

### Morning Briefing (8am User Local Time)

**Trigger:** User has calendar connected, trial is active

**Bro sends:**

> Good morning! Here's your day:
> 
> 📅 [Event count] events
> ⏰ [Task count] reminders
> 🌤️ [Weather brief if available]
> 
> Want the full breakdown?

**Edge case — No events:**
> "Your calendar's clear today. Rare win. Enjoy it — or want me to find something productive to do?"

---

### Evening Recap (Adaptive: User's "Day End")

**Trigger:** Hour 18 of trial OR user's local 8pm

**Bro sends (conditional):**

**If tasks completed:**
> Day done. Here's what we knocked out:
> 
> ✅ [Task 1]
> ✅ [Task 2]
> 
> **Tomorrow:** [Preview]
> 
> Anything else, or are you clocking out?

**If no tasks:**
> Day's winding down. No tasks completed today — that's fine, some days are like that.
> 
> Tomorrow's another chance to see what I can do. Want a morning briefing at 8am?

---

### Mid-Trial Nudge (Hour 12, Conditional)

**Trigger:** Engagement score < 3 interactions

**Bro sends:**

> Just checking in — we've got [X] hours left in your trial.
> 
> If you want to see what I can really do, try one of these:
> - "What's on my calendar this week?"
> - "Draft an email to [someone] about [topic]"
> - "Remind me to [thing] at [time tomorrow]"
> - "What should I know about [topic you're working on]?"
> 
> Or just tell me what you're working on and I'll figure out how to help.

**Edge case — Already Engaged:**
- Skip if user has 5+ interactions. Don't nag high-engagement users.

---

## GDPR & Compliance

### Consent Capture

**First data access (calendar/email):**

> Before I connect your [calendar/email], I need to confirm:
> 
> I'll access your data to help you manage it. I don't store content permanently — just what I need to provide the service. You can disconnect anytime.
> 
> Sound good? Tap to continue.

**Data retention policy:**
- Conversation history: 90 days post-cancellation
- Calendar/email cache: Real-time only, not stored
- User profile data: Until account deletion

### Right to be Forgotten

**User says "delete my data":**

> I'll delete everything — conversation history, memories, connected accounts. This can't be undone.
> 
> Type "DELETE" to confirm, or "keep" to cancel.

---

## Key Principles (Ironclad)

1. **Engineer the aha moment** — Track it. Amplify it. Convert on it.
2. **State machine, not linear flow** — Handle every branch, timeout, and failure.
3. **Default bias** — Make continuing the path of least resistance.
4. **Adaptive timing** — Respect user timezone and activity patterns.
5. **Specific over generic** — "You completed 3 tasks" beats "We did some stuff."
6. **Edge cases are features** — Ghost users, skeptics, and failures need messages too.
7. **Analytics everywhere** — If you can't measure it, you can't improve it.

---

## What Success Looks Like

**Good trial:**
- User connects at least 1 account
- User completes at least 1 task
- User asks Bro to remember something
- User returns 3+ times in 24 hours
- User engages with at least 1 proactive message

**Great trial:**
- User connects 2+ accounts
- User creates 3+ reminders/tasks
- User references Bro's memory ("What did I tell you about...")
- User asks about features ("Can you also do...")
- User initiates 5+ conversations

**Conversion-ready:**
- User expresses FOMO about losing access
- User asks about pricing without prompting
- User sets up recurring tasks (implies long-term intent)
- User tells others about Bro

---

## Next Steps

1. Implement message templates in TalkToBro backend
2. Set up cron jobs for automated touches
3. Build analytics to track engagement signals
4. Create conversion tracking (trial → paid)
5. A/B test message timing and copy

---

*Draft by GLM-5 | Pending Opus 4.6 review at 11:30*