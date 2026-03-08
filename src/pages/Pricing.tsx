import { Brain, Moon, LayoutGrid, Play, Puzzle, Server, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (!supabase || !user?.id) {
        setIsPro(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .maybeSingle();

      const active = !!data && ['active', 'trialing'].includes((data.status || '').toLowerCase()) && (data.plan || '').toLowerCase() !== 'free';
      setIsPro(active);
    };

    loadSubscription();
  }, [user?.id]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Go Pro Bro
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a 24-hour trial.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {[
              {
                id: 'starter',
                name: 'Starter',
                price: '£9',
                blurb: 'Talk to Bro',
                features: [
                  { text: 'Memory that doesn\'t reset', icon: 'Brain' },
                  { text: 'Bro works while you sleep', icon: 'Moon' },
                  { text: 'One Bro, every channel', icon: 'LayoutGrid' },
                  { text: 'Actual execution, not just talk', icon: 'Play' },
                  { text: 'Extensible skills for your workflow', icon: 'Puzzle' },
                  { text: 'Your infrastructure, your sovereignty', icon: 'Server' },
                ],
                cta: 'Start Starter trial',
                featured: false,
              },
              {
                id: 'pro',
                name: 'Pro 5x',
                price: '£29',
                blurb: '5x more usage than Starter',
                features: [
                  { text: 'Everything in Starter', icon: 'Check' },
                ],
                cta: isPro ? 'Current Plan' : 'Start Pro 5x trial',
                featured: true,
              },
              {
                id: 'elite',
                name: 'Pro 20x',
                price: '£99',
                blurb: '20x more usage than Starter',
                features: [
                  { text: 'Everything in Pro 5x', icon: 'Check' },
                ],
                cta: 'Start Pro 20x trial',
                featured: false,
              },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 bg-card cursor-pointer transition-all duration-200 hover:shadow-xl relative ${plan.featured ? 'border-2 border-accent' : 'border border-border'}`}
                onClick={() => navigate(`/onboarding?plan=${plan.id}`)}
              >
                {plan.id === 'pro' ? (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">Save 36%</div>
                ) : null}
                {plan.id === 'elite' ? (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">Save 45%</div>
                ) : null}
                {plan.featured ? (
                  <div className="inline-block mb-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">Recommended</div>
                ) : null}
                <h2 className="text-2xl font-semibold text-foreground mb-2">{plan.name}</h2>
                <div className="mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <span className="block text-sm text-muted-foreground mb-5">{plan.id === 'starter' ? 'For the curious' : plan.id === 'pro' ? 'For the enthusiast' : 'For the power user'}</span>
                <p className="text-sm text-foreground mb-4">{plan.blurb}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => {
                    const IconComponent = feature.icon === 'Brain' ? Brain
                      : feature.icon === 'Moon' ? Moon
                      : feature.icon === 'LayoutGrid' ? LayoutGrid
                      : feature.icon === 'Play' ? Play
                      : feature.icon === 'Puzzle' ? Puzzle
                      : feature.icon === 'Server' ? Server
                      : Check;
                    return (
                      <li key={feature.text} className="flex items-center gap-2 text-foreground">
                        <IconComponent className="w-4 h-4 text-accent" />
                        {feature.text}
                      </li>
                    );
                  })}
                </ul>
                <Button variant={plan.featured ? 'primary' : 'outline'} className={`w-full pointer-events-none ${plan.featured ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`} disabled={plan.id === 'pro' && isPro}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* What You Learn Section */}
          <div className="mb-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
What You Get
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Execution Systems',
                  desc: 'Build workflows that actually run: inbox handling, follow-ups, calendar actions, reminders, and ops execution.',
                },
                {
                  title: 'Real Integrations',
                  desc: 'Connect Bro to your real stack: email, calendar, docs, CRM, payments, repos, and automations.',
                },
                {
                  title: 'Your Own Agent Stack',
                  desc: 'Get the full setup playbook to run your own production-grade agent with memory, tools, and guardrails.',
                },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Radical Transparency */}
          <div className="mb-16 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Radical Transparency</span>
            </div>
            <p className="text-muted-foreground">
              We run Bro on real workflows, in real chats, with real consequences. No demo theatre. No fake automation.
              What you see is what we use daily.
            </p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: 'What does Pro include?',
                  a: 'Persistent memory, automations/workflows (Bro does it, not just suggests it), Calendar + Email + Docs integrations, higher usage, and a priority response lane.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes. Cancel anytime and keep access until the end of your billing period.',
                },
                {
                  q: 'How fast can I get value?',
                  a: 'Day one for quick wins. Pro users typically have automations running within a few days.',
                },
                {
                  q: 'Is this theory or implementation?',
                  a: 'Implementation. The goal is a working system in your actual workflow, not a folder of notes.',
                },
              ].map((faq) => (
                <div key={faq.q} className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium text-foreground mb-1">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 border-t border-border">
        <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 TalkToBro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;