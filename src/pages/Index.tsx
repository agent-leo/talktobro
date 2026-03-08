import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Mic,
  BookOpen,
  AlertTriangle,
  Bot,
  Brain,
  ArrowRight,
  ScanLine,
  MonitorSmartphone,
  MessageSquare,
  Globe,
  FileCode,
  Puzzle,
} from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo-new.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConversationFlow } from '@/components/ConversationFlow';
import { conversationFlows } from '@/data/conversationFlows';
import { useAuth } from '@/contexts/AuthContext';
import { LinkAccountDialog } from '@/components/LinkAccountDialog';
import { Header } from '@/components/Header';
import { Shoutouts } from '@/components/Shoutouts';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAnonymous } = useAuth();

  /** White logos invert in light mode to black; black logos invert in dark mode to white */
  const logoClass = (url?: string) =>
    `w-5 h-5${url?.includes('ffffff') || url?.includes('white') ? ' invert dark:invert-0' : url?.includes('111111') ? ' dark:invert' : ''}`;

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
      <main className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto w-full">
          {/* Logo / Title */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4 group cursor-default">
              <img 
                src={talktobroLogo} 
                alt="TalkToBro" 
                className="h-14 md:h-16 transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-serif text-2xl md:text-3xl text-foreground transition-colors duration-300 group-hover:text-foreground">TalkToBro</span>
            </div>
          </div>

          {/* Core Value Prop */}
          <div className="mb-8 space-y-3 animate-fade-in-delay-1">
            <h1 className="text-2xl md:text-4xl text-foreground leading-tight font-semibold">
              Bro that actually does things.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
              Clears your inbox. Sends emails. Manages your calendar. Checks you in for flights. 
              All from WhatsApp, Telegram, or any chat app you already use.
            </p>
          </div>

          {/* Shoutouts Carousel - moved up */}
          <div className="mb-10 animate-fade-in-delay-2">
            <Shoutouts />
          </div>

          {/* QR Codes - Try Free */}
          <div className="mb-10 animate-fade-in-delay-2">
            <div className="rounded-2xl border border-border bg-secondary/20 p-5 md:p-6">
              <div className="text-center max-w-xl mx-auto mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <ScanLine className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Choose your channel</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start talking to Bro on WhatsApp or Telegram. Same Bro, same brain, whichever app you already prefer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                <div className="rounded-2xl border border-border bg-background/80 p-4 md:p-5 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">WhatsApp</h3>
                    <p className="text-xs text-muted-foreground">Best if you already live in WhatsApp.</p>
                  </div>

                  <Button
                    onClick={() => window.open('https://wa.me/447361665083?text=Hey%20Bro', '_blank')}
                    className="w-full mb-4 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Open in WhatsApp
                  </Button>

                  <div className="rounded-xl border-2 border-foreground/20 p-2 shadow-lg bg-white">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src="/bro-whatsapp-qr.png"
                        alt="Bro WhatsApp QR code"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center mt-3">Scan from desktop, tap the button on mobile.</p>
                </div>

                <div className="rounded-2xl border border-border bg-background/80 p-4 md:p-5 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-foreground">Telegram</h3>
                    <p className="text-xs text-muted-foreground">Best if you want a cleaner bot-style flow.</p>
                  </div>

                  <Button
                    onClick={() => window.open('https://t.me/talk2brobot?start=heybro', '_blank')}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    Open in Telegram
                  </Button>

                  <div className="rounded-xl border-2 border-foreground/20 p-2 shadow-lg bg-white">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src="/bro-telegram-qr.png"
                        alt="Bro Telegram QR code"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center mt-3">Scan from desktop, tap the button on mobile.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Bro */}
          <div className="mb-10 animate-fade-in-delay-3">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              What's Bro?
            </h2>
            <p className="text-sm text-foreground/80 mb-4">
              Bro runs on your device. Lives in your chats. Remembers context. Gets real work done.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { icon: MonitorSmartphone, text: 'Runs on your device' },
                { icon: MessageSquare, text: 'Works across chat apps' },
                { icon: Brain, text: 'Persistent memory' },
                { icon: Globe, text: 'Browser automation' },
                { icon: FileCode, text: 'File + system actions' },
                { icon: Puzzle, text: 'Skills & plugins' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-foreground/90 py-1">
                  <item.icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Single Clean CTA */}
          <div className="mb-12 animate-fade-in-delay-3">
            <p className="text-center text-sm text-muted-foreground mb-4">Want help talking to Bro?</p>
            <Button 
              onClick={() => navigate('/book-call')} 
              variant="outline"
              className="w-full"
            >
              Talk to a real human
            </Button>
          </div>

          {/* Works with everything */}
          <div className="mb-10 animate-fade-in-delay-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
              Works with everything
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { name: 'WhatsApp', logo: 'https://cdn.simpleicons.org/whatsapp/25D366' },
                { name: 'Telegram', logo: 'https://cdn.simpleicons.org/telegram/26A5E4' },
                { name: 'Discord', logo: 'https://cdn.simpleicons.org/discord/5865F2' },
                { name: 'Slack', logo: 'https://www.google.com/s2/favicons?domain=slack.com&sz=64' },
                { name: 'Signal', logo: 'https://cdn.simpleicons.org/signal/3A76F0' },
                { name: 'iMessage', logo: 'https://cdn.simpleicons.org/apple/ffffff' },
                { name: 'Claude', logo: 'https://cdn.simpleicons.org/anthropic/FF6B35' },
                { name: 'GPT', logo: 'https://cdn.simpleicons.org/openai/white', fallbackLogo: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
                { name: 'Spotify', logo: 'https://cdn.simpleicons.org/spotify/1DB954' },
                { name: 'Hue', logo: 'https://cdn.simpleicons.org/philipshue/ffffff' },
                { name: 'Obsidian', logo: 'https://cdn.simpleicons.org/obsidian/7C3AED' },
                { name: 'Twitter', logo: 'https://cdn.simpleicons.org/x/ffffff' },
                { name: 'Browser', logo: 'https://cdn.simpleicons.org/googlechrome/4285F4' },
                { name: 'Gmail', logo: 'https://cdn.simpleicons.org/gmail/EA4335' },
                { name: 'GitHub', logo: 'https://cdn.simpleicons.org/github/ffffff' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/40">
                  {item.fallbackLogo ? (
                    <>
                      <img src={item.logo} alt={item.name} className={`${logoClass(item.logo)} hidden sm:block`} loading="lazy" />
                      <img src={item.fallbackLogo} alt={item.name} className="w-5 h-5 sm:hidden" loading="lazy" />
                    </>
                  ) : (
                    <img src={item.logo} alt={item.name} className={logoClass(item.logo)} loading="lazy" />
                  )}
                  <span className="text-sm text-foreground/80">{item.name}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link 
                to="/integrations"
                className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
              >
                View all 50+ integrations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
          <div className="mb-8 animate-fade-in-delay-2">
            <Button 
              onClick={() => navigate('/record')} 
              variant="ghost"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <Mic className="w-4 h-4" />
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

          {/* Entry Points */}
          <div className="mb-8 animate-fade-in-delay-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4 text-center">
              Or start here
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'money',
                'clarity',
                'workflows',
                'stack',
                'custom',
              ].map((flowId) => {
                const flow = conversationFlows[flowId];
                if (!flow) return null;
                return (
                  <Button
                    key={flow.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFlow(flow.id)}
                  >
                    {flow.title}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p>© 2026 TalkToBro</p>
          <div className="flex items-center gap-4">
            <Link to="/crisis" className="hover:text-foreground transition-colors">
              Support
            </Link>
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