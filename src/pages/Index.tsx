import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConversationFlow } from '@/components/ConversationFlow';
import { conversationFlows } from '@/data/conversationFlows';

const Index = () => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  if (selectedFlow) {
    return (
      <ConversationFlow
        flowId={selectedFlow}
        onBack={() => setSelectedFlow(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="flex flex-col justify-center min-h-screen px-6 py-16">
        <div className="max-w-2xl mx-auto w-full">
          {/* Logo / Title */}
          <div className="mb-16 animate-fade-in">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
              TalkToBro
            </h1>
            <p className="text-muted-foreground text-lg">
              A place to pause before you trade.
            </p>
          </div>

          {/* Core Message */}
          <div className="mb-16 space-y-6 animate-fade-in-delay-1">
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              This is not advice.<br />
              This is not therapy.<br />
              This is a moment to slow down.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              When decisions feel urgent, when losses feel heavy, when leverage 
              feels necessary — sometimes you just need a place to stop and think.
            </p>
          </div>

          {/* Entry Points */}
          <div className="space-y-4 mb-16 animate-fade-in-delay-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-6">
              What brings you here?
            </p>
            
            {Object.values(conversationFlows).map((flow, index) => (
              <Button
                key={flow.id}
                variant="entry"
                onClick={() => setSelectedFlow(flow.id)}
                className={`animate-fade-in`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <span className="font-medium">{flow.title}</span>
              </Button>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-sm text-muted-foreground space-y-3 animate-fade-in-delay-4">
            <p>
              This is not financial advice. We don't make trading recommendations. 
              We don't know your situation. We're just here to help you pause.
            </p>
            <p>
              If you're experiencing a mental health crisis, please reach out to 
              a professional or call your local crisis line.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 TalkToBro</p>
          <p>Anonymous. No data collected. No accounts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
