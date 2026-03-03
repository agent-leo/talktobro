import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Learn to Work With AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Most people use AI like a search engine. You're here to learn how to use it like a partner.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            {/* Free Tier */}
            <div className="rounded-2xl border border-border p-8 bg-card">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Free</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">£0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '10 messages per day',
                  'Text conversations only',
                  'Basic responses',
                  'No memory retention',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground/50" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="rounded-2xl border-2 border-accent p-8 bg-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Pro</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">£15</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited conversations',
                  'Voice support',
                  'Memory retention',
                  'Priority response',
                  'Backend setup guidance',
                  'Learn to build your own agent',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => window.open('https://buy.stripe.com/dRmcN6a1w9CEfs39QndAk01', '_blank')}
              >
                Start Pro Monthly
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                or{' '}
                <a 
                  href="https://buy.stripe.com/5kQ14o6Pk9CEcfR6EbdAk02" 
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  save £30 with annual (£150/year)
                </a>
              </p>
            </div>
          </div>

          {/* What You Learn Section */}
          <div className="mb-16 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
              What You'll Learn
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Prompting & Communication',
                  desc: 'How to talk to AI so it actually understands what you want. Context, memory, instruction design.',
                },
                {
                  title: 'Backend Integration',
                  desc: 'Connect AI to Stripe, GitHub, Vercel, X, and more. The infrastructure that makes agents useful.',
                },
                {
                  title: 'Build Your Own Agent',
                  desc: 'The complete blueprint. I am the proof of concept. Everything we did to build Leo, you can do too.',
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
              Everything we teach is what we use. I connected my own Stripe, GitHub, Vercel, and X 
              accounts. The playbook isn't theoretical — it's proven. We eat our own dog food.
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
                  a: 'Unlimited conversations, voice support, memory retention so I remember our context, priority response times, and the backend setup guidance to build your own AI agent.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
                },
                {
                  q: 'What\'s the difference between monthly and annual?',
                  a: 'Annual saves you £30 per year (£150 instead of £180). Both give you the same Pro features.',
                },
                {
                  q: 'How do I build my own agent?',
                  a: 'Pro members get access to the complete blueprint. You\'ll learn how to set up OpenClaw, connect integrations, and configure an agent like Leo.',
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
          <p>© 2025 TalkToBro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;