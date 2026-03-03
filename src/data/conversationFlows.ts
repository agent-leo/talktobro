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
    title: 'Choose the first agent to build',
    description: 'Turn vague ideas into a concrete first agent',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good. Stop chasing tools. Start with outcomes.',
        nextStep: 'outcome',
        delay: 1200,
      },
      outcome: {
        id: 'outcome',
        type: 'options',
        content: 'Pick the outcome that actually matters.',
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
        content: 'Build an ops agent first: inbox triage, follow-ups, and daily priorities.',
        nextStep: 'commit',
        delay: 1800,
      },
      revenue: {
        id: 'revenue',
        type: 'reflection',
        content: 'Build a sales agent first: capture leads, qualify fast, book calls.',
        nextStep: 'commit',
        delay: 1800,
      },
      ops: {
        id: 'ops',
        type: 'reflection',
        content: 'Build a control-tower agent: tasks, reminders, nudges, one command view.',
        nextStep: 'commit',
        delay: 1800,
      },
      unsure: {
        id: 'unsure',
        type: 'reflection',
        content: 'No drama. Pick one recurring pain you hate. That is your first use case.',
        nextStep: 'commit',
        delay: 1800,
      },
      commit: {
        id: 'commit',
        type: 'message',
        content: 'Rule: one workflow, one metric, one week. Ship it. Then scale.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  stack: {
    id: 'stack',
    title: 'Build the right stack (without overbuilding)',
    description: 'Model + tools + memory + channels, done properly',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good. Most people overbuild before proving value.',
        nextStep: 'stage',
        delay: 1200,
      },
      stage: {
        id: 'stage',
        type: 'options',
        content: 'Where are you right now?',
        options: [
          { label: 'Just starting', value: 'start', nextStep: 'start' },
          { label: 'Have tools, not integrated', value: 'middle', nextStep: 'middle' },
          { label: 'Already running automations', value: 'advanced', nextStep: 'advanced' },
        ],
      },
      start: {
        id: 'start',
        type: 'message',
        content: 'Starter stack only: one model, one memory layer, one channel, one payment path.',
        nextStep: 'close',
        delay: 1800,
      },
      middle: {
        id: 'middle',
        type: 'message',
        content: 'Your bottleneck is orchestration. Lock the flow: capture → decide → act → log.',
        nextStep: 'close',
        delay: 1800,
      },
      advanced: {
        id: 'advanced',
        type: 'message',
        content: 'Your bottleneck is reliability. Add monitoring, retries, and failure alerts before any new features.',
        nextStep: 'close',
        delay: 1800,
      },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Best stack = survives Monday. Not the one that farms likes on X.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  workflows: {
    id: 'workflows',
    title: 'Automate my workflow now',
    description: 'Turn repeated tasks into reliable agents',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good. This is where human judgement meets machine speed.',
        nextStep: 'pick',
        delay: 1200,
      },
      pick: {
        id: 'pick',
        type: 'options',
        content: 'What do we automate first?',
        options: [
          { label: 'Lead follow-ups', value: 'lead', nextStep: 'lead' },
          { label: 'Inbox + meeting prep', value: 'inbox', nextStep: 'inbox' },
          { label: 'Content repurposing', value: 'content', nextStep: 'content' },
          { label: 'Client onboarding', value: 'onboard', nextStep: 'onboard' },
        ],
      },
      lead: { id: 'lead', type: 'message', content: 'Lead flow: capture → score → draft reply → schedule follow-up.', nextStep: 'close', delay: 1700 },
      inbox: { id: 'inbox', type: 'message', content: 'Morning loop: summarise inbox → rank urgency → draft top 3 replies.', nextStep: 'close', delay: 1700 },
      content: { id: 'content', type: 'message', content: 'Content engine: voice note → transcript → X post → email draft.', nextStep: 'close', delay: 1700 },
      onboard: { id: 'onboard', type: 'message', content: 'Onboarding flow: collect context → confirm payment → send welcome + next steps.', nextStep: 'close', delay: 1700 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Start with one painful weekly loop. If it works, scale.',
        nextStep: 'end',
        delay: 1700,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  prompting: {
    id: 'prompting',
    title: 'Fix my prompts and outputs',
    description: 'Get sharper responses and stronger execution from AI',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Prompting problems are clarity problems. AI mirrors your mess.',
        nextStep: 'issue',
        delay: 1100,
      },
      issue: {
        id: 'issue',
        type: 'options',
        content: 'What keeps breaking?',
        options: [
          { label: 'Outputs are too generic', value: 'generic', nextStep: 'generic' },
          { label: 'It misses context', value: 'context', nextStep: 'context' },
          { label: 'It talks, does not execute', value: 'execute', nextStep: 'execute' },
        ],
      },
      generic: { id: 'generic', type: 'message', content: 'Set constraints: audience, tone, format, one real example.', nextStep: 'close', delay: 1600 },
      context: { id: 'context', type: 'message', content: 'State first: goal, status, blockers, definition of done.', nextStep: 'close', delay: 1600 },
      execute: { id: 'execute', type: 'message', content: 'Stop asking for thoughts. Ask for action: do step X, then report result.', nextStep: 'close', delay: 1600 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Prompting is management. Better manager = better output.',
        nextStep: 'end',
        delay: 1600,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  money: {
    id: 'money',
    title: 'Monetise an AI agent',
    description: 'Package outcomes buyers will pay for',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Correct. Don’t sell AI. Sell a result.',
        nextStep: 'offer',
        delay: 1200,
      },
      offer: {
        id: 'offer',
        type: 'options',
        content: 'Which offer are you actually closest to?',
        options: [
          { label: 'Service replacement', value: 'replace', nextStep: 'replace' },
          { label: 'Productised coaching', value: 'coach', nextStep: 'coach' },
          { label: 'Internal ops system', value: 'ops', nextStep: 'ops' },
        ],
      },
      replace: { id: 'replace', type: 'message', content: 'Anchor pricing to a human role, then show 24/7 coverage + faster turnaround.', nextStep: 'close', delay: 1800 },
      coach: { id: 'coach', type: 'message', content: 'Sell transformation: confusion to capability in a fixed timeline.', nextStep: 'close', delay: 1800 },
      ops: { id: 'ops', type: 'message', content: 'Sell reliability: fewer dropped balls, faster responses, cleaner handoffs.', nextStep: 'close', delay: 1800 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'If the buyer can’t explain ROI in one sentence, your offer isn’t ready.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  mindset: {
    id: 'mindset',
    title: 'I am overwhelmed — simplify it',
    description: 'Cut noise, focus fast, and ship',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Normal. The pace is insane. Simplify, then execute.',
        nextStep: 'state',
        delay: 1200,
      },
      state: {
        id: 'state',
        type: 'options',
        content: 'What is true for you right now?',
        options: [
          { label: 'Too many tools', value: 'tools', nextStep: 'tools' },
          { label: 'Fear of falling behind', value: 'fear', nextStep: 'fear' },
          { label: 'I keep starting, not finishing', value: 'finish', nextStep: 'finish' },
        ],
      },
      tools: { id: 'tools', type: 'message', content: 'Pick one stack for 30 days. Ignore the noise. Depth beats novelty.', nextStep: 'close', delay: 1700 },
      fear: { id: 'fear', type: 'message', content: 'You don’t win by consuming AI content. You win by shipping one useful workflow.', nextStep: 'close', delay: 1700 },
      finish: { id: 'finish', type: 'message', content: 'Shrink scope until finishing is unavoidable. Finished small beats unfinished big.', nextStep: 'close', delay: 1700 },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Your edge is implementation speed, not encyclopaedic knowledge.',
        nextStep: 'end',
        delay: 1700,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },

  custom: {
    id: 'custom',
    title: 'Build my custom 30-day plan',
    description: 'Map your first 30 days of agent implementation',
    startStep: 'intro',
    steps: {
      intro: {
        id: 'intro',
        type: 'message',
        content: 'Good. We build around your bottlenecks, not generic templates.',
        nextStep: 'inputs',
        delay: 1200,
      },
      inputs: {
        id: 'inputs',
        type: 'message',
        content: 'Bring 3 things: weekly workflow, current tools, top bottleneck.',
        nextStep: 'close',
        delay: 1600,
      },
      close: {
        id: 'close',
        type: 'reflection',
        content: 'Then we build your 30-day roadmap: Week 1 setup, Week 2 automation, Week 3 optimisation, Week 4 scale.',
        nextStep: 'end',
        delay: 1800,
      },
      end: { id: 'end', type: 'pause', content: '' },
    },
  },
};