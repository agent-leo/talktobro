export interface GlossaryEntry {
  id: string;
  term: string;
  category: string;
  description: string;
  flowId?: string; // Links to a conversation flow if available
  aliases?: string[];
}

export const glossaryEntries: GlossaryEntry[] = [
  // A
  {
    id: 'action-bias',
    term: 'Action Bias',
    category: 'Psychology',
    description: 'The tendency to prefer doing something over doing nothing, even when inaction is better. Leads to overtrading.',
    flowId: 'control',
  },
  {
    id: 'anchoring',
    term: 'Anchoring',
    category: 'Cognitive Bias',
    description: 'Fixating on a specific price or number. "It was at $100, so it\'s cheap at $80" — ignoring new information.',
    flowId: 'loss',
  },
  {
    id: 'averaging-down',
    term: 'Averaging Down',
    category: 'Position Management',
    description: 'Adding to a losing position hoping it will recover. Often driven by denial rather than strategy.',
    aliases: ['Adding to losers', 'Doubling down'],
  },
  {
    id: 'analysis-paralysis',
    term: 'Analysis Paralysis',
    category: 'Decision Making',
    description: 'Over-analyzing to the point of inaction. Sometimes a way to avoid the anxiety of actually trading.',
    aliases: ['Overthinking'],
  },
  {
    id: 'availability-heuristic',
    term: 'Availability Heuristic',
    category: 'Cognitive Bias',
    description: 'Judging probability by how easily examples come to mind. Recent wins feel more common than they are.',
  },
  
  // B
  {
    id: 'bag-holding',
    term: 'Bag Holding',
    category: 'Loss Management',
    description: 'Holding onto a losing position for too long, hoping it will return to entry price.',
    flowId: 'loss',
  },
  {
    id: 'bandwagon-effect',
    term: 'Bandwagon Effect',
    category: 'Social Psychology',
    description: 'Following the crowd because everyone else is doing it. "Everyone\'s buying, so it must be good."',
    flowId: 'control',
    aliases: ['Herd mentality', 'Following the crowd'],
  },
  {
    id: 'blown-account',
    term: 'Blown Account',
    category: 'Risk',
    description: 'Losing most or all of your trading capital. A painful but survivable experience.',
    flowId: 'loss',
    aliases: ['Blowing up'],
  },
  {
    id: 'boredom-trading',
    term: 'Boredom Trading',
    category: 'Emotional States',
    description: 'Trading because you need stimulation, not because there\'s opportunity.',
    flowId: 'control',
    aliases: ['Trading for action'],
  },
  {
    id: 'breakeven-obsession',
    term: 'Breakeven Obsession',
    category: 'Psychology',
    description: 'Desperate to exit at entry price rather than accept a smaller loss. Often leads to bigger losses.',
    flowId: 'loss',
    aliases: ['Getting back to even'],
  },
  
  // C
  {
    id: 'chasing',
    term: 'Chasing',
    category: 'Entry Behavior',
    description: 'Entering after a move has already happened, driven by fear of missing more.',
    flowId: 'control',
    aliases: ['Chasing the move', 'Late entry'],
  },
  {
    id: 'compulsive-checking',
    term: 'Compulsive Checking',
    category: 'Behavioral Patterns',
    description: 'Unable to stop looking at charts or P&L. Often masking anxiety, not gathering information.',
    flowId: 'control',
  },
  {
    id: 'confirmation-bias',
    term: 'Confirmation Bias',
    category: 'Cognitive Bias',
    description: 'Only seeing evidence that supports your existing position. Ignoring red flags because you\'re already in.',
    flowId: 'loss',
  },
  {
    id: 'cognitive-dissonance',
    term: 'Cognitive Dissonance',
    category: 'Psychology',
    description: 'The discomfort of holding conflicting beliefs. "I\'m a good trader but I keep losing."',
    flowId: 'stuck',
  },
  
  // D
  {
    id: 'disposition-effect',
    term: 'Disposition Effect',
    category: 'Psychology',
    description: 'Selling winners too early and holding losers too long. One of the most documented trading biases.',
    flowId: 'loss',
  },
  {
    id: 'drawdown',
    term: 'Drawdown',
    category: 'Performance',
    description: 'A period of sustained losses. What matters is how you respond to it.',
    flowId: 'stuck',
    aliases: ['DD', 'Losing streak'],
  },
  {
    id: 'denial',
    term: 'Denial',
    category: 'Emotional States',
    description: 'Refusing to accept a loss or mistake. The mind\'s way of protecting the ego.',
    flowId: 'loss',
  },
  {
    id: 'dunning-kruger',
    term: 'Dunning-Kruger Effect',
    category: 'Cognitive Bias',
    description: 'Beginners overestimating their skill, experts underestimating theirs. Early wins are especially dangerous.',
    flowId: 'overconfidence',
  },
  
  // E
  {
    id: 'endowment-effect',
    term: 'Endowment Effect',
    category: 'Cognitive Bias',
    description: 'Overvaluing what you already own. Your position isn\'t special just because it\'s yours.',
    flowId: 'loss',
  },
  {
    id: 'escalation-of-commitment',
    term: 'Escalation of Commitment',
    category: 'Psychology',
    description: 'Investing more in a failing course of action to justify past decisions. "I\'ve come this far..."',
    flowId: 'loss',
    aliases: ['Commitment bias'],
  },
  {
    id: 'euphoria',
    term: 'Euphoria',
    category: 'Emotional States',
    description: 'The high after big wins. Often more dangerous than fear because it feels good.',
    flowId: 'overconfidence',
    aliases: ['Trading high', 'Winner\'s high'],
  },
  {
    id: 'exit-anxiety',
    term: 'Exit Anxiety',
    category: 'Position Management',
    description: 'Difficulty closing positions — either taking profits too early or holding losers too long.',
  },
  
  // F
  {
    id: 'fomo',
    term: 'FOMO',
    category: 'Emotional States',
    description: 'Fear of Missing Out. The anxiety that others are profiting while you\'re not in the trade.',
    flowId: 'fomo',
    aliases: ['Fear of missing out'],
  },
  {
    id: 'framing-effect',
    term: 'Framing Effect',
    category: 'Cognitive Bias',
    description: 'Being influenced by how information is presented. A "90% success rate" feels different from "10% failure rate."',
  },
  {
    id: 'frustration',
    term: 'Frustration',
    category: 'Emotional States',
    description: 'The gap between what you expect and what\'s happening. Often leads to forcing trades.',
    flowId: 'stuck',
  },
  
  // G
  {
    id: 'gamblers-fallacy',
    term: 'Gambler\'s Fallacy',
    category: 'Cognitive Bias',
    description: 'Believing past events affect independent future outcomes. "I\'ve lost 5 in a row, I\'m due for a win."',
    flowId: 'control',
    aliases: ['Monte Carlo fallacy'],
  },
  {
    id: 'gambling-mindset',
    term: 'Gambling Mindset',
    category: 'Behavioral Patterns',
    description: 'When trading becomes about the thrill rather than the edge. The outcome matters more than the process.',
    flowId: 'control',
  },
  {
    id: 'greed',
    term: 'Greed',
    category: 'Emotional States',
    description: 'Wanting more than the market is offering. Often appears after wins, not before them.',
    aliases: ['Overreaching'],
  },
  
  // H
  {
    id: 'hindsight-bias',
    term: 'Hindsight Bias',
    category: 'Cognitive Bias',
    description: '"I knew it would happen." Overestimating your ability to predict after the fact.',
    aliases: ['Knew-it-all-along effect'],
  },
  {
    id: 'hopium',
    term: 'Hopium',
    category: 'Emotional States',
    description: 'Holding a position based on hope rather than evidence. A form of denial with a catchy name.',
    flowId: 'loss',
    aliases: ['Holding and hoping'],
  },
  {
    id: 'hot-hand-fallacy',
    term: 'Hot Hand Fallacy',
    category: 'Cognitive Bias',
    description: 'Believing a winning streak means more wins are coming. Success doesn\'t guarantee future success.',
    flowId: 'leverage',
    aliases: ['Hot streak'],
  },
  
  // I
  {
    id: 'illusion-of-control',
    term: 'Illusion of Control',
    category: 'Cognitive Bias',
    description: 'Believing you can influence random outcomes. The market doesn\'t care about your rituals.',
    flowId: 'control',
  },
  {
    id: 'impulse-trading',
    term: 'Impulse Trading',
    category: 'Behavioral Patterns',
    description: 'Entering trades without a plan. The click happens before the thought.',
    flowId: 'control',
    aliases: ['Impulsive entries'],
  },
  {
    id: 'information-overload',
    term: 'Information Overload',
    category: 'Decision Making',
    description: 'Too many indicators, too many sources, too much noise. More data doesn\'t mean better decisions.',
    aliases: ['Analysis overload'],
  },
  
  // L
  {
    id: 'leverage',
    term: 'Leverage',
    category: 'Risk',
    description: 'Using borrowed capital to increase position size. Amplifies both gains and losses.',
    flowId: 'leverage',
    aliases: ['Margin', 'Gearing'],
  },
  {
    id: 'liquidation',
    term: 'Liquidation',
    category: 'Risk',
    description: 'When leverage goes wrong. The exchange closes your position because margin is exhausted.',
    flowId: 'loss',
    aliases: ['Getting liquidated', 'Rekt'],
  },
  {
    id: 'loss-aversion',
    term: 'Loss Aversion',
    category: 'Psychology',
    description: 'Feeling losses more intensely than equivalent gains. Hardwired into human psychology.',
    flowId: 'loss',
  },
  
  // M
  {
    id: 'martingale',
    term: 'Martingale',
    category: 'Risk',
    description: 'Doubling down after each loss. Mathematically guaranteed to fail eventually.',
    flowId: 'leverage',
  },
  {
    id: 'mental-accounting',
    term: 'Mental Accounting',
    category: 'Cognitive Bias',
    description: 'Treating money differently based on its source. "House money" feels less real than your deposit.',
    flowId: 'leverage',
    aliases: ['House money effect'],
  },
  
  // N
  {
    id: 'narrative-fallacy',
    term: 'Narrative Fallacy',
    category: 'Cognitive Bias',
    description: 'Creating stories to explain random price movements. The market doesn\'t need a "reason" to move.',
  },
  {
    id: 'negativity-bias',
    term: 'Negativity Bias',
    category: 'Psychology',
    description: 'Losses and negative events stick more than wins. One bad trade can overshadow ten good ones.',
    flowId: 'loss',
  },
  {
    id: 'numbness',
    term: 'Numbness',
    category: 'Emotional States',
    description: 'Feeling nothing after losses. A protective response, but not a decision-making state.',
    flowId: 'loss',
    aliases: ['Emotional shutdown', 'Dissociation'],
  },
  
  // O
  {
    id: 'optimism-bias',
    term: 'Optimism Bias',
    category: 'Cognitive Bias',
    description: 'Believing you\'re less likely to experience negative events. "That won\'t happen to me."',
    flowId: 'leverage',
  },
  {
    id: 'outcome-bias',
    term: 'Outcome Bias',
    category: 'Cognitive Bias',
    description: 'Judging a decision by its result, not its quality. A bad trade can make money; a good trade can lose.',
  },
  {
    id: 'overconfidence',
    term: 'Overconfidence',
    category: 'Psychology',
    description: 'Overestimating your knowledge, skill, or edge. Often peaks right before a painful lesson.',
    flowId: 'overconfidence',
    aliases: ['Hubris'],
  },
  {
    id: 'overtrading',
    term: 'Overtrading',
    category: 'Behavioral Patterns',
    description: 'Trading too frequently or with too much size. Usually driven by emotion, not opportunity.',
    flowId: 'control',
    aliases: ['Trading too much'],
  },
  
  // P
  {
    id: 'panic-selling',
    term: 'Panic Selling',
    category: 'Exit Behavior',
    description: 'Exiting in fear during volatility. The opposite of a planned stop loss.',
    flowId: 'loss',
    aliases: ['Panic exit', 'Capitulation'],
  },
  {
    id: 'peak-end-rule',
    term: 'Peak-End Rule',
    category: 'Psychology',
    description: 'Remembering experiences by their peaks and endings. One big win can mask a month of poor trading.',
  },
  {
    id: 'perfectionism',
    term: 'Perfectionism',
    category: 'Psychology',
    description: 'Needing trades to work out exactly as planned. Markets don\'t cooperate with perfectionists.',
  },
  {
    id: 'pressure',
    term: 'Pressure',
    category: 'Emotional States',
    description: 'The feeling that you need to make something happen. Often comes from outside trading.',
    flowId: 'leverage',
  },
  {
    id: 'probability-neglect',
    term: 'Probability Neglect',
    category: 'Cognitive Bias',
    description: 'Ignoring actual odds when emotions are high. Fear or hope override rational assessment.',
  },
  
  // R
  {
    id: 'recency-bias',
    term: 'Recency Bias',
    category: 'Cognitive Bias',
    description: 'Overweighting recent events and underweighting older data. Last week feels more real than last year.',
    flowId: 'control',
    aliases: ['Recency effect'],
  },
  {
    id: 'representativeness-heuristic',
    term: 'Representativeness Heuristic',
    category: 'Cognitive Bias',
    description: 'Judging probability by similarity to a pattern. "This looks like the last breakout" — but it might not be.',
  },
  {
    id: 'revenge-trading',
    term: 'Revenge Trading',
    category: 'Behavioral Patterns',
    description: 'Trading to recover losses immediately. The market doesn\'t know you\'re trying to get even.',
    flowId: 'revenge',
    aliases: ['Getting even'],
  },
  {
    id: 'regret',
    term: 'Regret',
    category: 'Emotional States',
    description: 'Replaying trades that didn\'t work. Useful for learning, destructive when it loops.',
    flowId: 'loss',
  },
  {
    id: 'regret-aversion',
    term: 'Regret Aversion',
    category: 'Psychology',
    description: 'Avoiding decisions to avoid potential regret. Not trading to avoid feeling bad about losing.',
  },
  {
    id: 'risk-of-ruin',
    term: 'Risk of Ruin',
    category: 'Risk',
    description: 'The probability of losing enough to stop trading. The number that actually matters.',
    flowId: 'leverage',
  },
  
  // S
  {
    id: 'selective-perception',
    term: 'Selective Perception',
    category: 'Cognitive Bias',
    description: 'Seeing what you expect to see. Bullish? You\'ll find bullish signals everywhere.',
    flowId: 'loss',
    aliases: ['Cherry picking'],
  },
  {
    id: 'self-attribution-bias',
    term: 'Self-Attribution Bias',
    category: 'Psychology',
    description: 'Wins are skill, losses are bad luck. Protects the ego but prevents learning.',
    flowId: 'stuck',
  },
  {
    id: 'shame',
    term: 'Shame',
    category: 'Emotional States',
    description: 'Feeling like you are the problem, not just that you made a mistake. Heavy and isolating.',
    flowId: 'loss',
  },
  {
    id: 'size-creep',
    term: 'Size Creep',
    category: 'Risk',
    description: 'Gradually increasing position size without noticing. Usually follows a winning streak.',
    flowId: 'leverage',
  },
  {
    id: 'status-quo-bias',
    term: 'Status Quo Bias',
    category: 'Psychology',
    description: 'Preference for the current state of affairs. Staying in a bad position because change feels risky.',
    flowId: 'stuck',
  },
  {
    id: 'stuck',
    term: 'Stuck',
    category: 'Emotional States',
    description: 'When nothing seems to work. A prolonged drawdown with no clear way forward.',
    flowId: 'stuck',
    aliases: ['In a rut', 'Lost'],
  },
  {
    id: 'sunk-cost',
    term: 'Sunk Cost Fallacy',
    category: 'Psychology',
    description: 'Holding because of what you\'ve already lost, not because of what might happen next.',
    flowId: 'loss',
    aliases: ['Sunk cost'],
  },
  {
    id: 'survivorship-bias',
    term: 'Survivorship Bias',
    category: 'Cognitive Bias',
    description: 'Only seeing the winners. The 10x trader on Twitter is visible; the thousands who blew up are silent.',
  },
  
  // T
  {
    id: 'tilt',
    term: 'Tilt',
    category: 'Emotional States',
    description: 'Emotional destabilization after losses. Borrowed from poker, equally destructive in trading.',
    flowId: 'control',
    aliases: ['Tilting', 'On tilt'],
  },
  {
    id: 'traders-ruin',
    term: 'Trader\'s Ruin',
    category: 'Risk',
    description: 'The mathematical certainty of going broke with negative expected value. No money management saves a losing system.',
    flowId: 'leverage',
  },
  
  // U
  {
    id: 'urgency',
    term: 'Urgency',
    category: 'Emotional States',
    description: 'The feeling that you must act now. Almost always a signal to slow down instead.',
    flowId: 'loss',
  },
  {
    id: 'unit-bias',
    term: 'Unit Bias',
    category: 'Cognitive Bias',
    description: 'Preferring whole units. Buying 1 BTC feels better than 0.7 BTC, regardless of correct sizing.',
    flowId: 'leverage',
  },
  
  // W
  {
    id: 'wired',
    term: 'Wired',
    category: 'Physical States',
    description: 'Body in high alert, can\'t sit still. Your nervous system asking for something other than trading.',
    flowId: 'leverage',
  },
  {
    id: 'wishful-thinking',
    term: 'Wishful Thinking',
    category: 'Psychology',
    description: 'Believing something because you want it to be true. The position is red but you see green.',
    flowId: 'loss',
    aliases: ['Magical thinking'],
  },
  
  // Z
  {
    id: 'zero-sum-thinking',
    term: 'Zero-Sum Thinking',
    category: 'Psychology',
    description: 'Viewing trading as pure competition. Someone else\'s win doesn\'t have to be your loss.',
  },
];

// Group entries by first letter
export const getEntriesByLetter = (): Record<string, GlossaryEntry[]> => {
  const grouped: Record<string, GlossaryEntry[]> = {};
  
  // Create all letter buckets including aliases
  const allEntries: { letter: string; entry: GlossaryEntry; displayTerm: string }[] = [];
  
  glossaryEntries.forEach(entry => {
    // Add main term
    const mainLetter = entry.term[0].toUpperCase();
    allEntries.push({ letter: mainLetter, entry, displayTerm: entry.term });
    
    // Add aliases
    entry.aliases?.forEach(alias => {
      const aliasLetter = alias[0].toUpperCase();
      allEntries.push({ letter: aliasLetter, entry: { ...entry, term: alias }, displayTerm: alias });
    });
  });
  
  // Sort and group
  allEntries.sort((a, b) => a.displayTerm.localeCompare(b.displayTerm));
  
  allEntries.forEach(({ letter, entry }) => {
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(entry);
  });
  
  return grouped;
};

export const getAvailableLetters = (): string[] => {
  const entries = getEntriesByLetter();
  return Object.keys(entries).sort();
};
