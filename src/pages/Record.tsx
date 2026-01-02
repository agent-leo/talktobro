import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo.png';
import { Button } from '@/components/ui/button';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { useAuth } from '@/contexts/AuthContext';

type TriggerType = 'before_trade' | 'after_loss' | 'fomo' | 'panic' | 'overconfidence' | 'revenge' | 'stuck' | 'other';

const triggers: { id: TriggerType; label: string; description: string }[] = [
  { id: 'before_trade', label: 'Before a trade', description: 'About to enter a position' },
  { id: 'after_loss', label: 'After a loss', description: 'Just experienced a loss' },
  { id: 'fomo', label: 'Feeling FOMO', description: 'Fear of missing out' },
  { id: 'panic', label: 'Panic', description: 'Feeling urgent or panicked' },
  { id: 'overconfidence', label: 'Overconfident', description: 'Feeling invincible' },
  { id: 'revenge', label: 'Revenge trading', description: 'Trying to win it back' },
  { id: 'stuck', label: 'Stuck', description: 'Can\'t decide what to do' },
  { id: 'other', label: 'Something else', description: 'Just need to talk' },
];

const Record = () => {
  const [searchParams] = useSearchParams();
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle trigger from URL
  useEffect(() => {
    const triggerParam = searchParams.get('trigger') as TriggerType;
    if (triggerParam && triggers.some(t => t.id === triggerParam)) {
      setSelectedTrigger(triggerParam);
    }
  }, [searchParams]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleComplete = () => {
    navigate('/ledger');
  };

  const handleCancel = () => {
    setSelectedTrigger(null);
  };

  const handleBack = () => {
    if (selectedTrigger) {
      setSelectedTrigger(null);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <img src={talktobroLogo} alt="TalkToBro" className="h-8" />
      </header>

      <main className="flex-1 flex flex-col">
        {selectedTrigger ? (
          <VoiceRecorder 
            trigger={selectedTrigger}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ) : (
          /* Trigger selection */
          <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-lg mx-auto w-full">
            <div className="text-center mb-10 animate-fade-in">
              <h1 className="text-2xl font-serif text-foreground mb-2">
                What brings you here?
              </h1>
              <p className="text-muted-foreground">
                Select what feels closest
              </p>
            </div>

            <div className="space-y-3">
              {triggers.map((trigger, index) => (
                <Button
                  key={trigger.id}
                  variant="entry"
                  onClick={() => setSelectedTrigger(trigger.id)}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{trigger.label}</span>
                    <span className="text-sm text-muted-foreground">{trigger.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Record;
