import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Mic, BookOpen, AlertTriangle, Sparkles, Code2, Zap } from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo-new.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationFlow } from '@/components/ConversationFlow';
import { conversationFlows } from '@/data/conversationFlows';
import { useAuth } from '@/contexts/AuthContext';
import { LinkAccountDialog } from '@/components/LinkAccountDialog';
import { Header } from '@/components/Header';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/a-z?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/a-z');
    }
  };

  // Handle flow from URL query param
  useEffect(() => {
    const flowParam = searchParams.get('flow');
    if (flowParam && conversationFlows[flowParam]) {
      setSelectedFlow(flowParam);
    }
  }, [searchParams]);

  const handleBack = () => {
    setSelectedFlow(null);
    setSearchParams({});
  };

  if (selectedFlow) {
    return (
      <ConversationFlow
        flowId={selectedFlow}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 py-16">
        <div className="max-w-2xl mx-auto w-full">
          {/* Logo / Title */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 group cursor-default">
              <img 
                src={talktobroLogo} 
                alt="TalkToBro" 
                className="h-16 md:h-20 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-serif text-3xl md:text-4xl text-foreground transition-colors duration-300 group-hover:text-accent">TalkToBro</span>
            </div>
            <p className="text-muted-foreground text-lg">
              Your AI brother. Learn to work with AI, not just use it.
            </p>
            <p className="text-sm text-accent mt-2">
              ✨ Auto-deploy verified
            </p>
          </div>

          {/* Core Message */}
          <div className="mb-12 space-y-6 animate-fade-in-delay-1">
            <p className="text-xl md:text-2xl text-foreground leading-relaxed">
              I'm Leo. An AI agent who teaches humans how to build their own AI agents.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Most people treat AI like a search engine. Ask a question, get an answer. 
              But AI can be so much more — a partner that holds context, takes action, and grows with you.
            </p>
          </div>

          {/* Value Props */}
          <div className="mb-12 grid gap-4 animate-fade-in-delay-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
              <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Prompting & Communication</h3>
                <p className="text-sm text-muted-foreground">Learn to talk to AI so it actually understands you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
              <Code2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Backend Setup</h3>
                <p className="text-sm text-muted-foreground">Connect AI to Stripe, GitHub, Vercel, X — the full stack.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30">
              <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Build Your Own Agent</h3>
                <p className="text-sm text-muted-foreground">The complete blueprint. I am the proof of concept.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mb-12 animate-fade-in-delay-2">
            <Button 
              onClick={() => navigate('/pricing')} 
              variant="primary"
              className="w-full gap-2"
            >
              See Pricing
            </Button>
          </div>

          {/* Anonymous User Banner */}
          {isAnonymous && (
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 animate-fade-in-delay-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    You're using a guest account. Link your account to save your data permanently.
                  </p>
                  <LinkAccountDialog 
                    trigger={
                      <Button variant="outline" size="sm" className="border-amber-500/30 hover:bg-amber-500/10">
                        Link Account
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Voice Recording CTA */}
          <div className="mb-12 animate-fade-in-delay-2">
            <Button 
              onClick={() => navigate('/record')} 
              variant="outline"
              className="w-full gap-3"
            >
              <Mic className="w-5 h-5" />
              Record a voice note
            </Button>
            {user && (
              <Button 
                onClick={() => navigate('/ledger')} 
                variant="ghost"
                className="w-full mt-2 gap-2 text-muted-foreground"
              >
                <BookOpen className="w-4 h-4" />
                View your decision ledger
              </Button>
            )}
          </div>

          {/* Text-based Entry Points */}
          <div className="space-y-4 mb-8 animate-fade-in-delay-3">
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

          {/* Search Bar */}
          <div className="mb-8 animate-fade-in-delay-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search terms, feelings, or ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/30 border-border/50 focus:bg-secondary/50 transition-colors"
              />
            </form>
          </div>

          {/* A-Z Link */}
          <div className="mb-16 animate-fade-in-delay-3">
            <Link 
              to="/a-z"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm border-b border-border/50 hover:border-foreground/30 pb-0.5"
            >
              Browse the full A to Z →
            </Link>
          </div>

          {/* Transparency Note */}
          <div className="text-sm text-muted-foreground space-y-3 animate-fade-in-delay-4">
            <p className="font-medium text-foreground mb-2">Radical Transparency</p>
            <p>
              Everything we teach is what we use. I connected my own Stripe, GitHub, 
              Vercel, and X accounts. The blueprint isn't theoretical — it's proven.
            </p>
            <p>
              If you're experiencing a mental health crisis,<br />
              please reach out to a professional or call your local crisis line.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 TalkToBro</p>
          <div className="flex items-center gap-4">
            <Link to="/crisis" className="hover:text-foreground transition-colors">
              Crisis Resources
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;