export interface FlowStep {
  id: string;
  type: 'message' | 'options' | 'reflection' | 'pause';
  content: string;
  options?: {
    label: string;
    value: string;
    nextStep: string;
  }[];
  nextStep?: string;
  delay?: number;
}

export interface ConversationFlow {
  id: string;
  title: string;
  description: string;
  steps: Record<string, FlowStep>;
  startStep: string;
}

export const conversationFlows: Record<string, ConversationFlow> = {
  clarity: {
    id: 'clarity',
    title: 'I want clarity on what agent to build',
    description: 'Turn vague ideas into a concrete first agent',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good move. Most people start with tools. We start with outcomes.',
        nextStep: 'outcome',
        delay: 1200,
      },
      outcome: {
        id: 'outcome',
        type: 'options',
        content: 'What outcome matters most right now?',
        options: [
          { label: 'Save me time every day', value: 'time', nextStep: 'time' },
          { label: 'Generate leads/revenue', value: 'revenue', nextStep: 'revenue' },
          { label: 'Reduce chaos + missed follow-ups', value: 'ops', nextStep: 'ops' },
          { label: 'I am not sure yet', value: 'unsure', nextStep: 'unsure' },
        ],
      },
      time: {
        id: 'time',
        type: 'reflection',
        content: 'Then your first agent should be operational: inbox triage, follow-up drafting, and daily priority summaries.',
        nextStep: 'commit',
        delay: 1800,
      },
      revenue: {
        id: 'revenue',
        type: 'reflection',
        content: 'Then your first agent should be commercial: lead capture, qualification, and booking conversations automatically.',
        nextStep: 'commit',
        delay: 1800,
      },
      ops: {
        id: 'ops',
        type: 'reflection',
        content: 'Then your first agent should be a control tower: one place for tasks, reminders, and proactive nudges.',
        nextStep: 'commit',
        delay: 1800,
      },
      unsure: {
        id: 'unsure',
        type: 'reflection',
        content: 'No problem. Pick one recurring pain you hate doing manually. That becomes your first agent use case.',
        nextStep: 'commit',
        delay: 1800,
      },
      commit: {
        id: 'commit',
        type: 'message',
        content: 'Rule: one workflow, one metric, one week. Ship small, then expand.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  stack: {
    id: 'stack',
    title: 'I need the right AI stack',
    description: 'Model + tools + memory + channels without overengineering',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Perfect. Most people overbuild the stack before validating value.',
        nextStep: 'stage',
        delay: 1200,
      },
      stage: {
        id: 'stage',
        type: 'options',
        content: 'What stage are you at?',
        options: [
          { label: 'Just starting', value: 'start', nextStep: 'start' },
          { label: 'Have tools, not integrated', value: 'middle', nextStep: 'middle' },
          { label: 'Already running automations', value: 'advanced', nextStep: 'advanced' },
        ],
      },
      start: {
        id: 'start',
        type: 'message',
        content: 'Use this starter stack: one primary model, one memory layer, one messaging channel, one payment path.',
        nextStep: 'close',
        delay: 1800,
      },
      middle: {
        id: 'middle',
        type: 'message',
        content: 'Your bottleneck is orchestration. Standardise data flow: capture → decide → act → log.',
        nextStep: 'close',
        delay: 1800,
      },
      advanced: {
        id: 'advanced',
        type: 'message',
        content: 'Your bottleneck is reliability. Add monitoring, retries, and failure alerts before adding more features.',
        nextStep: 'close',
        delay: 1800,
      },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'The best stack is the one that survives Monday, not the one that wins on Twitter.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  workflows: {
    id: 'workflows',
    title: 'I want to automate my workflow',
    description: 'Turn repeat tasks into reliable agents',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good. Automation is where humans and machines actually merge intelligence.',
        nextStep: 'pick',
        delay: 1200,
      },
      pick: {
        id: 'pick',
        type: 'options',
        content: 'What should we automate first?',
        options: [
          { label: 'Lead follow-ups', value: 'lead', nextStep: 'lead' },
          { label: 'Inbox + meeting prep', value: 'inbox', nextStep: 'inbox' },
          { label: 'Content repurposing', value: 'content', nextStep: 'content' },
          { label: 'Client onboarding', value: 'onboard', nextStep: 'onboard' },
        ],
      },
      lead: { id: 'lead', type: 'message', content: 'Build a sequence: capture lead → score lead → draft reply → schedule follow-up.', nextStep: 'close', delay: 1700 },
      inbox: { id: 'inbox', type: 'message', content: 'Build a morning loop: summarise inbox → rank urgency → draft top 3 replies.', nextStep: 'close', delay: 1700 },
      content: { id: 'content', type: 'message', content: 'Build one source-to-many flow: voice note → transcript → X post → email draft.', nextStep: 'close', delay: 1700 },
      onboard: { id: 'onboard', type: 'message', content: 'Build a handoff flow: collect context → payment confirm → welcome + next steps.', nextStep: 'close', delay: 1700 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Start with one painful loop you repeat weekly. If it works there, scale it.',
        nextStep: 'end',
        delay: 1700,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  prompting: {
    id: 'prompting',
    title: 'I want better prompting and outputs',
    description: 'Get cleaner responses and stronger execution from AI',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Most prompting issues are clarity issues. AI mirrors your instructions.',
        nextStep: 'issue',
        delay: 1100,
      },
      issue: {
        id: 'issue',
        type: 'options',
        content: 'What breaks most often?',
        options: [
          { label: 'Outputs are too generic', value: 'generic', nextStep: 'generic' },
          { label: 'It misses context', value: 'context', nextStep: 'context' },
          { label: 'It talks, does not execute', value: 'execute', nextStep: 'execute' },
        ],
      },
      generic: { id: 'generic', type: 'message', content: 'Add constraints: audience, tone, format, and one concrete example.', nextStep: 'close', delay: 1600 },
      context: { id: 'context', type: 'message', content: 'Give state first: goal, current status, blockers, and what done looks like.', nextStep: 'close', delay: 1600 },
      execute: { id: 'execute', type: 'message', content: 'Switch from “help me think” to “do this step now, then report result”.', nextStep: 'close', delay: 1600 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Prompting is management. Better manager, better machine output.',
        nextStep: 'end',
        delay: 1600,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  money: {
    id: 'money',
    title: 'I want to monetise an AI agent',
    description: 'Package outcomes people will pay for',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Great. Don’t sell AI. Sell a result with AI behind it.',
        nextStep: 'offer',
        delay: 1200,
      },
      offer: {
        id: 'offer',
        type: 'options',
        content: 'Which offer are you closer to?',
        options: [
          { label: 'Service replacement', value: 'replace', nextStep: 'replace' },
          { label: 'Productised coaching', value: 'coach', nextStep: 'coach' },
          { label: 'Internal ops system', value: 'ops', nextStep: 'ops' },
        ],
      },
      replace: { id: 'replace', type: 'message', content: 'Price against the cost of a human role, then show 24/7 coverage and faster turnaround.', nextStep: 'close', delay: 1800 },
      coach: { id: 'coach', type: 'message', content: 'Sell transformation: from confusion to capability in a fixed time frame.', nextStep: 'close', delay: 1800 },
      ops: { id: 'ops', type: 'message', content: 'Sell reliability: fewer dropped balls, faster response times, cleaner handoffs.', nextStep: 'close', delay: 1800 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'If a buyer can’t explain the ROI in one sentence, your offer is not ready.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  mindset: {
    id: 'mindset',
    title: 'I feel overwhelmed by AI and tools',
    description: 'Cut noise and build with confidence',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Totally normal. The pace is insane. We simplify, then execute.',
        nextStep: 'state',
        delay: 1200,
      },
      state: {
        id: 'state',
        type: 'options',
        content: 'What feels truest right now?',
        options: [
          { label: 'Too many tools', value: 'tools', nextStep: 'tools' },
          { label: 'Fear of falling behind', value: 'fear', nextStep: 'fear' },
          { label: 'I keep starting, not finishing', value: 'finish', nextStep: 'finish' },
        ],
      },
      tools: { id: 'tools', type: 'message', content: 'Pick one stack for 30 days. Ignore the rest. Depth beats novelty.', nextStep: 'close', delay: 1700 },
      fear: { id: 'fear', type: 'message', content: 'You do not win by consuming AI content. You win by shipping one useful workflow.', nextStep: 'close', delay: 1700 },
      finish: { id: 'finish', type: 'message', content: 'Shrink scope until completion is unavoidable. Finished small beats unfinished big.', nextStep: 'close', delay: 1700 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Your edge is not knowing everything. Your edge is implementing faster than most people dare.',
        nextStep: 'end',
        delay: 1700,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  custom: {
    id: 'custom',
    title: 'I want a custom plan for my business',
    description: 'Map your first 30 days of agent implementation',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Perfect. We’ll design this around your exact bottlenecks, not generic templates.',
        nextStep: 'inputs',
        delay: 1200,
      },
      inputs: {
        id: 'inputs',
        type: 'message',
        content: 'Bring me 3 things: your weekly workflow, your current tools, and your top bottleneck.',
        nextStep: 'close',
        delay: 1600,
      },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'From there, we’ll build a 30-day roadmap: Week 1 setup, Week 2 automation, Week 3 optimisation, Week 4 scale.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },
};