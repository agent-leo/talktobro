import { useEffect, useState } from 'react';

interface BreathingCircleProps {
  duration?: number; // Total duration in ms
}

export function BreathingCircle({ duration = 12000 }: BreathingCircleProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    const cycle = () => {
      setPhase('inhale');
      setTimeout(() => setPhase('hold'), 4000);
      setTimeout(() => setPhase('exhale'), 5000);
    };
    
    cycle();
    const interval = setInterval(cycle, 9000);
    
    return () => clearInterval(interval);
  }, []);

  const phaseText = {
    inhale: 'Breathe in',
    hold: 'Hold',
    exhale: 'Breathe out',
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <div 
          className={`absolute w-24 h-24 rounded-full bg-accent/10 transition-transform duration-[4000ms] ease-in-out ${
            phase === 'inhale' ? 'scale-150' : phase === 'hold' ? 'scale-150' : 'scale-100'
          }`}
        />
        
        {/* Main circle */}
        <div 
          className={`relative w-20 h-20 rounded-full border-2 border-accent/40 bg-accent/5 transition-transform duration-[4000ms] ease-in-out flex items-center justify-center ${
            phase === 'inhale' ? 'scale-125' : phase === 'hold' ? 'scale-125' : 'scale-100'
          }`}
        >
          {/* Inner dot */}
          <div className="w-2 h-2 rounded-full bg-accent/60" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground font-medium tracking-wide transition-opacity duration-500">
        {phaseText[phase]}
      </p>
    </div>
  );
}
