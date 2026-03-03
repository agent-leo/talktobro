import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const goalsPresets = [
  'Get clients with an AI agent',
  'Automate follow-ups and admin',
  'Build my first agent this week',
  'Fix prompts and output quality',
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    goals: '',
    experience: 'beginner',
    style: 'direct',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentCta = useMemo(() => {
    const key = 'ttb_cta_variant';
    const saved = localStorage.getItem(key);
    if (saved === 'a') return 'Start Pro now';
    if (saved === 'b') return 'Go to payment';
    const next = Math.random() > 0.5 ? 'a' : 'b';
    localStorage.setItem(key, next);
    return next === 'a' ? 'Start Pro now' : 'Go to payment';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const normalisePhone = (raw: string) => {
    let phone = raw.replace(/\s+/g, '');
    if (!phone.startsWith('+')) {
      if (phone.startsWith('0')) phone = '+44' + phone.substring(1);
      else phone = '+' + phone;
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const phone = normalisePhone(formData.phone);

      if (supabase) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              name: formData.name.trim(),
              phone,
              goals: formData.goals.trim(),
              experience: formData.experience,
              style: formData.style,
            },
          ]);

        if (insertError && insertError.code !== '23505') throw insertError;
      }

      setSubmitted(true);
      setTimeout(() => {
        window.open('https://buy.stripe.com/dRmcN6a1w9CEfs39QndAk01', '_blank');
      }, 1400);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Something broke. Try again in 10 seconds.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-serif text-foreground mb-4">You are in.</h1>
            <p className="text-muted-foreground mb-6">
              After payment, add <strong>+447361665083</strong> and send "Hey Leo" on WhatsApp.
              Leo will recognise your number and continue from there.
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to payment...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className={`w-10 h-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-secondary'}`} />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">Quick setup</h1>
                  <p className="text-muted-foreground">This takes 30 seconds.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="What should I call you?" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">WhatsApp number</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7XXX XXXXXX"
                    type="tel"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">This is where Leo replies once you join.</p>
                </div>

                <Button type="button" variant="primary" className="w-full" onClick={() => setStep(2)} disabled={!formData.name || !formData.phone}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-serif text-foreground mb-2">What are we fixing first?</h1>
                  <p className="text-muted-foreground">Pick one outcome. We execute from there.</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {goalsPresets.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, goals: goal }))}
                      className={`text-left px-3 py-2 rounded-md border transition-colors ${
                        formData.goals === goal
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-input bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Main goal (editable)</label>
                  <Input
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Type your own goal"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current level</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="builder">Builder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tone</label>
                    <select
                      name="style"
                      value={formData.style}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                      <option value="direct">Direct</option>
                      <option value="conversational">Conversational</option>
                      <option value="technical">Technical</option>
                      <option value="supportive">Supportive</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">What happens next</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You pay. You message Leo. We build. Unlimited chat, voice support, memory retained.
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting || !formData.goals}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Locking this in...
                    </>
                  ) : (
                    <>
                      {paymentCta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
