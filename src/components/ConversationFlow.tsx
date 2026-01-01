import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { conversationFlows, FlowStep } from '@/data/conversationFlows';
import { ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  type: 'system' | 'user';
  content: string;
  stepType?: FlowStep['type'];
}

interface ConversationFlowProps {
  flowId: string;
  onBack: () => void;
}

export function ConversationFlow({ flowId, onBack }: ConversationFlowProps) {
  const flow = conversationFlows[flowId];
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showOptions]);

  useEffect(() => {
    if (flow) {
      const firstStep = flow.steps[flow.startStep];
      processStep(firstStep);
    }
  }, [flowId]);

  const processStep = (step: FlowStep) => {
    if (step.id === 'end') {
      setCurrentStep(null);
      return;
    }

    setIsTyping(true);
    setShowOptions(false);

    const delay = step.delay || 1500;

    setTimeout(() => {
      if (step.content) {
        setMessages(prev => [...prev, {
          id: `${step.id}-${Date.now()}`,
          type: 'system',
          content: step.content,
          stepType: step.type,
        }]);
      }
      setIsTyping(false);
      setCurrentStep(step);

      if (step.type === 'options') {
        setTimeout(() => setShowOptions(true), 300);
      } else if (step.nextStep) {
        const nextStep = flow.steps[step.nextStep];
        if (nextStep) {
          setTimeout(() => processStep(nextStep), step.delay || 1500);
        }
      }
    }, delay);
  };

  const handleOptionSelect = (option: { label: string; value: string; nextStep: string }) => {
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: option.label,
    }]);
    setShowOptions(false);

    const nextStep = flow.steps[option.nextStep];
    if (nextStep) {
      processStep(nextStep);
    }
  };

  const handleStartOver = () => {
    setMessages([]);
    setCurrentStep(null);
    setShowOptions(false);
    setIsTyping(false);
    const firstStep = flow.steps[flow.startStep];
    processStep(firstStep);
  };

  if (!flow) return null;

  const isComplete = !currentStep && messages.length > 0 && !isTyping;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-10 border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="pt-20 pb-48 px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`animate-fade-in ${
                message.type === 'user' ? 'flex justify-end' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {message.type === 'system' ? (
                <div className={`max-w-lg ${
                  message.stepType === 'reflection' 
                    ? 'bg-secondary/50 rounded-2xl px-6 py-5 border border-border' 
                    : message.stepType === 'pause'
                    ? 'bg-accent/10 rounded-2xl px-6 py-5 border border-accent/20'
                    : ''
                }`}>
                  <p className="text-foreground text-lg leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 max-w-sm">
                  <p className="text-base">{message.content}</p>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-1.5 py-4 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Options */}
      {showOptions && currentStep?.options && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-8 px-6 animate-fade-in">
          <div className="max-w-2xl mx-auto space-y-3">
            {currentStep.options.map((option, index) => (
              <Button
                key={option.value}
                variant="response"
                onClick={() => handleOptionSelect(option)}
                className="w-full animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Complete state */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-12 pb-8 px-6 animate-fade-in">
          <div className="max-w-2xl mx-auto flex gap-4">
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="flex-1"
            >
              Start over
            </Button>
            <Button
              variant="default"
              onClick={onBack}
              className="flex-1"
            >
              Back to home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
