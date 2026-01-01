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
  
  // B
  {
    id: 'bag-holding',
    term: 'Bag Holding',
    category: 'Loss Management',
    description: 'Holding onto a losing position for too long, hoping it will return to entry price.',
    flowId: 'loss',
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
  
  // D
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
  
  // E
  {
    id: 'euphoria',
    term: 'Euphoria',
    category: 'Emotional States',
    description: 'The high after big wins. Often more dangerous than fear because it feels good.',
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
    flowId: 'control',
    aliases: ['Fear of missing out'],
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
    id: 'hopium',
    term: 'Hopium',
    category: 'Emotional States',
    description: 'Holding a position based on hope rather than evidence. A form of denial with a catchy name.',
    flowId: 'loss',
    aliases: ['Holding and hoping'],
  },
  
  // I
  {
    id: 'impulse-trading',
    term: 'Impulse Trading',
    category: 'Behavioral Patterns',
    description: 'Entering trades without a plan. The click happens before the thought.',
    flowId: 'control',
    aliases: ['Impulsive entries'],
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
  
  // N
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
  
  // R
  {
    id: 'revenge-trading',
    term: 'Revenge Trading',
    category: 'Behavioral Patterns',
    description: 'Trading to recover losses immediately. The market doesn\'t know you\'re trying to get even.',
    flowId: 'loss',
    aliases: ['Revenge trading', 'Getting even'],
  },
  {
    id: 'regret',
    term: 'Regret',
    category: 'Emotional States',
    description: 'Replaying trades that didn\'t work. Useful for learning, destructive when it loops.',
    flowId: 'loss',
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
    id: 'stuck',
    term: 'Stuck',
    category: 'Emotional States',
    description: 'When nothing seems to work. A prolonged drawdown with no clear way forward.',
    flowId: 'stuck',
    aliases: ['In a rut', 'Lost'],
  },
  {
    id: 'sunk-cost',
    term: 'Sunk Cost',
    category: 'Psychology',
    description: 'Holding because of what you\'ve already lost, not because of what might happen next.',
    flowId: 'loss',
    aliases: ['Sunk cost fallacy'],
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
  
  // U
  {
    id: 'urgency',
    term: 'Urgency',
    category: 'Emotional States',
    description: 'The feeling that you must act now. Almost always a signal to slow down instead.',
    flowId: 'loss',
  },
  
  // W
  {
    id: 'wired',
    term: 'Wired',
    category: 'Physical States',
    description: 'Body in high alert, can\'t sit still. Your nervous system asking for something other than trading.',
    flowId: 'leverage',
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
