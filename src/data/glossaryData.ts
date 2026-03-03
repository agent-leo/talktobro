export interface GlossaryEntry {
  id: string;
  term: string;
  category: string;
  description: string;
  flowId?: string;
  aliases?: string[];
}

export const glossaryEntries: GlossaryEntry[] = [
  { id: 'agent', term: 'Agent', category: 'Foundations', description: 'An AI system that can decide and act across tools, not just answer prompts.', flowId: 'clarity' },
  { id: 'agent-loop', term: 'Agent Loop', category: 'Architecture', description: 'Capture context → decide next action → execute → log result.', flowId: 'stack' },
  { id: 'api', term: 'API', category: 'Technical', description: 'A structured way for software systems to talk and exchange actions/data.', flowId: 'stack' },
  { id: 'automation', term: 'Automation', category: 'Execution', description: 'Turning repeated tasks into reliable machine-executed workflows.', flowId: 'workflows' },
  { id: 'backlog', term: 'Backlog', category: 'Execution', description: 'A prioritised queue of tasks your human+agent system should complete.', flowId: 'workflows' },
  { id: 'context-window', term: 'Context Window', category: 'Prompting', description: 'How much information a model can use in one turn before it forgets.', flowId: 'prompting' },
  { id: 'conversion', term: 'Conversion', category: 'Monetisation', description: 'When a prospect moves from interest to paid action.', flowId: 'money' },
  { id: 'control-tower', term: 'Control Tower', category: 'Operations', description: 'One interface that monitors tasks, comms, reminders, and failures.', flowId: 'workflows' },
  { id: 'data-model', term: 'Data Model', category: 'Architecture', description: 'The schema your system uses to keep state clean and searchable.', flowId: 'stack' },
  { id: 'delegation', term: 'Delegation', category: 'Mindset', description: 'Handing clear outcomes to machines while keeping human judgement at key checkpoints.', flowId: 'mindset' },
  { id: 'edge-case', term: 'Edge Case', category: 'Reliability', description: 'A less common scenario that can break your automation if unhandled.', flowId: 'stack' },
  { id: 'execution-gap', term: 'Execution Gap', category: 'Mindset', description: 'The distance between knowing what to do and consistently shipping it.', flowId: 'mindset' },
  { id: 'feedback-loop', term: 'Feedback Loop', category: 'Architecture', description: 'A cycle where outputs are measured and used to improve next outputs.', flowId: 'workflows' },
  { id: 'first-agent', term: 'First Agent', category: 'Foundations', description: 'Your initial high-ROI workflow automation, scoped to one painful loop.', flowId: 'clarity' },
  { id: 'handoff', term: 'Handoff', category: 'Operations', description: 'The point where a task moves between human and machine ownership.', flowId: 'workflows' },
  { id: 'human-in-the-loop', term: 'Human-in-the-Loop', category: 'Safety', description: 'Critical approvals stay with humans; machines handle speed and repetition.', flowId: 'custom', aliases: ['HITL'] },
  { id: 'inference-cost', term: 'Inference Cost', category: 'Economics', description: 'The runtime cost of model calls when your agent executes tasks.', flowId: 'money' },
  { id: 'integration', term: 'Integration', category: 'Technical', description: 'Connecting your stack to tools like Stripe, GitHub, calendars, and CRM.', flowId: 'stack' },
  { id: 'lead-qualification', term: 'Lead Qualification', category: 'Monetisation', description: 'Filtering inbound leads so effort goes to highest-probability buyers.', flowId: 'money' },
  { id: 'memory-layer', term: 'Memory Layer', category: 'Architecture', description: 'Persistent storage that gives your agent continuity over time.', flowId: 'stack' },
  { id: 'mvp-agent', term: 'MVP Agent', category: 'Execution', description: 'Smallest functional agent that proves value in a real workflow.', flowId: 'clarity' },
  { id: 'north-star-metric', term: 'North Star Metric', category: 'Strategy', description: 'Single measure that tracks whether your agent system is actually winning.', flowId: 'custom' },
  { id: 'ops-debt', term: 'Ops Debt', category: 'Operations', description: 'Manual follow-ups and messy processes that silently tax growth.', flowId: 'workflows' },
  { id: 'orchestration', term: 'Orchestration', category: 'Architecture', description: 'Coordinating models, tools, and triggers into one reliable sequence.', flowId: 'stack' },
  { id: 'prompt-contract', term: 'Prompt Contract', category: 'Prompting', description: 'Clear instruction format defining scope, style, output, and constraints.', flowId: 'prompting' },
  { id: 'productised-service', term: 'Productised Service', category: 'Monetisation', description: 'A repeatable AI-enabled offer with defined scope, pricing, and delivery.', flowId: 'money' },
  { id: 'retry-logic', term: 'Retry Logic', category: 'Reliability', description: 'Automatic retries for transient failures so workflows do not silently die.', flowId: 'stack' },
  { id: 'roi', term: 'ROI', category: 'Economics', description: 'Return on investment — the value generated versus cost of building/running.', flowId: 'money' },
  { id: 'scope-creep', term: 'Scope Creep', category: 'Execution', description: 'When build scope expands faster than delivery, killing momentum.', flowId: 'mindset' },
  { id: 'signal-vs-noise', term: 'Signal vs Noise', category: 'Mindset', description: 'Separating useful execution data from distraction and tool hype.', flowId: 'mindset' },
  { id: 'sop', term: 'SOP', category: 'Operations', description: 'Standard Operating Procedure used to codify repeatable workflows.', flowId: 'custom', aliases: ['Standard Operating Procedure'] },
  { id: 'toolchain', term: 'Toolchain', category: 'Technical', description: 'The connected set of tools your agent uses to execute outcomes.', flowId: 'stack' },
  { id: 'workflow', term: 'Workflow', category: 'Execution', description: 'A repeatable sequence of steps that can be delegated to an agent.', flowId: 'workflows' },
  { id: 'workflow-first', term: 'Workflow-First', category: 'Strategy', description: 'Start from pain and process, then pick tools. Never the other way round.', flowId: 'clarity' },
];

export const getEntriesByLetter = (): Record<string, GlossaryEntry[]> => {
  const grouped: Record<string, GlossaryEntry[]> = {};
  const allEntries: { letter: string; entry: GlossaryEntry; displayTerm: string }[] = [];

  glossaryEntries.forEach(entry => {
    const mainLetter = entry.term[0].toUpperCase();
    allEntries.push({ letter: mainLetter, entry, displayTerm: entry.term });

    entry.aliases?.forEach(alias => {
      const aliasLetter = alias[0].toUpperCase();
      allEntries.push({ letter: aliasLetter, entry: { ...entry, term: alias }, displayTerm: alias });
    });
  });

  allEntries.sort((a, b) => a.displayTerm.localeCompare(b.displayTerm));

  allEntries.forEach(({ letter, entry }) => {
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(entry);
  });

  return grouped;
};

export const getAvailableLetters = (): string[] => {
  const entries = getEntriesByLetter();
  return Object.keys(entries).sort();
};