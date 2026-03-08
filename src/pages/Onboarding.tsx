import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const Onboarding = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPlan = useMemo(() => {
    const q = (searchParams.get('plan') || 'starter').toLowerCase();
    return ['starter', 'pro', 'elite'].includes(q) ? q : 'starter';
  }, [searchParams]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    preferredChannel: 'whatsapp',
    phone: '',
    telegramHandle: '',
    telegramUserId: '',
    goals: 'Get clients with an AI agent',
    experience: 'beginner',
    style: 'direct',
    plan: initialPlan,
    durationMonths: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checkoutUrlState, setCheckoutUrlState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const planPricing: Record<string, number> = { starter: 9, pro: 29, elite: 99 };
  const durationDiscounts: Record<number, number> = { 1: 0, 3: 0.1, 6: 0.15, 12: 0.25 };
  const monthlyPrice = planPricing[formData.plan] || 9;
  const discount = durationDiscounts[formData.durationMonths] || 0;
  const billingTotal = Math.round(monthlyPrice * formData.durationMonths * (1 - discount) * 100) / 100;
  const fullTotal = monthlyPrice * formData.durationMonths;
  const savings = Math.round((fullTotal - billingTotal) * 100) / 100;
  const planLabels: Record<string, string> = { starter: 'Started', pro: 'Pro 5x', elite: 'Pro 20x' };
  const paymentCta = formData.plan === 'starter' ? 'Get Started' : `Get ${planLabels[formData.plan]}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const normalisePhone = (raw: string) => {
    let phone = raw.replace(/\s+/g, '').replace(/-/g, '');
    if (!phone.startsWith('+')) {
      if (phone.startsWith('0')) phone = '+44' + phone.substring(1);
      else phone = '+' + phone;
    }
    return phone;
  };

  const isValidPhone = (phone: string) => /^\+[1-9]\d{7,14}$/.test(phone);

  const fallbackCheckoutUrl = 'https://talktobro.com/pricing';

  const withRetry = async <T,>(fn: () => Promise<T>, attempts = 3, delayMs = 500): Promise<T> => {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1) {
          await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        }
      }
    }
    throw lastErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const isWhatsapp = formData.preferredChannel === 'whatsapp';
      const phone = isWhatsapp ? normalisePhone(formData.phone) : null;

      if (isWhatsapp && (!phone || !isValidPhone(phone))) {
        throw new Error('Please enter a valid WhatsApp number in international format.');
      }

      if (!isWhatsapp && !formData.telegramHandle.trim()) {
        throw new Error('Please enter your Telegram @handle.');
      }

      if (!isWhatsapp && !/^\d{5,20}$/.test(formData.telegramUserId.trim())) {
        throw new Error('Please enter your Telegram numeric user ID (from @userinfobot).');
      }

      if (supabase) {
        const preferredChannel = formData.preferredChannel;

        // Instant owner alert (best-effort, never blocks onboarding flow)
        try {
          await supabase.functions.invoke('notify-owner', {
            body: {
              event_type: 'onboarding_submitted',
              payload: {
                name: formData.name.trim() || 'Unknown',
                channel: preferredChannel,
                contact: preferredChannel === 'telegram' ? formData.telegramUserId.trim() : phone,
                status: 'checkout_started',
                time: new Date().toISOString(),
              },
            },
          });
        } catch (_notifyErr) {
          // silent: alerting should not break conversions
        }

        if (user?.id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              name: formData.name.trim(),
              phone,
              goals: formData.goals.trim(),
              experience: formData.experience,
              style: formData.style,
              onboarding_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) throw profileError;
        }
      }

      let checkoutUrl = fallbackCheckoutUrl;

      if (supabase) {
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-concierge-checkout', {
          body: {
            name: formData.name.trim() || 'there',
            preferred_channel: formData.preferredChannel,
            phone:
              formData.preferredChannel === 'telegram'
                ? formData.telegramUserId.trim()
                : phone,
            goal: formData.goals.trim() || '',
            plan: formData.plan,
            duration_months: formData.durationMonths,
          },
        });

        if (checkoutError) throw checkoutError;
        if (checkoutData?.url) checkoutUrl = checkoutData.url;
      }

      setCheckoutUrlState(checkoutUrl);
      setSubmitted(true);
    } catch (err) {
      console.error('Error saving user:', err);
      const msg = err instanceof Error ? err.message : 'Something broke. Try again in 10 seconds.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-md mx-auto w-full">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-5">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-serif text-foreground mb-2">One step left: start your 24-hour trial</h1>
              <p className="text-foreground/80">Complete checkout first, then your Bro goes live instantly.</p>
            </div>

            {/* Step 1: Complete checkout (Primary) */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-sm flex items-center justify-center">1</span>
Start your personalised 24-hour trial in Stripe
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Card is required for activation and tracking. Cancel before trial ends and you won’t be charged.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => window.open(checkoutUrlState || fallbackCheckoutUrl, '_blank')}
              >
Start my custom Bro checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Step 2: Locked until checkout completes */}
            <div className="bg-secondary/30 border border-border rounded-xl p-6 mb-6 opacity-60">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-foreground text-sm flex items-center justify-center">2</span>
                Connect with Bro
              </h2>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">Complete checkout above to unlock Bro's contact details.</p>
                <div className="bg-background rounded-lg p-3 border border-border text-center">
                  <span className="text-muted-foreground text-sm">🔒 Available after checkout</span>
                </div>
              </div>
            </div>

                        {/* Trial Status */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Trial starts when checkout completes. Then message Bro and you’re in.
              </p>
            </div>
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
                  <label className="block text-sm font-medium text-foreground mb-2">Preferred chat channel</label>
                  <select
                    name="preferredChannel"
                    value={formData.preferredChannel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                {formData.preferredChannel === 'telegram' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Telegram @handle</label>
                      <Input
                        name="telegramHandle"
                        value={formData.telegramHandle}
                        onChange={handleChange}
                        placeholder="@yourusername"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Telegram numeric user ID</label>
                      <Input
                        name="telegramUserId"
                        value={formData.telegramUserId}
                        onChange={handleChange}
                        placeholder="e.g. 123456789"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Get this from Telegram bot <a className="underline" href="https://t.me/userinfobot" target="_blank" rel="noreferrer">@userinfobot</a> so we can securely activate your account.
                      </p>
                    </div>
                  </div>
                ) : (
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
                    <p className="text-xs text-muted-foreground mt-1">This is where Bro replies once you join.</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || (formData.preferredChannel === 'telegram' ? (!formData.telegramHandle || !formData.telegramUserId) : !formData.phone)}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-serif text-foreground mb-2">Go Pro Bro</h1>
                  <p className="text-muted-foreground">Every plan includes Bro, unlimited projects, and access to our latest models.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm your Bro</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { id: 'starter', label: 'Starter', price: 'For the curious', badge: null },
                      { id: 'pro', label: 'Pro 5x', price: 'For the enthusiast', badge: 'Save 36%' },
                      { id: 'elite', label: 'Pro 20x', price: 'For the power user', badge: 'Save 45%' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, plan: p.id }))}
                        className={`relative text-left px-3 py-2 rounded-md border transition-colors ${
                          formData.plan === p.id
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-input bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p.badge ? (
                          <span className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">{p.badge}</span>
                        ) : null}
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs">{p.price}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Billing duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { months: 1, label: '1 mo', save: 'Full price' },
                      { months: 3, label: '3 mo', save: 'Save 10%' },
                      { months: 6, label: '6 mo', save: 'Save 15%' },
                      { months: 12, label: '12 mo', save: 'Save 25%' },
                    ].map((d) => (
                      <button
                        key={d.months}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, durationMonths: d.months }))}
                        className={`text-left px-3 py-2 rounded-md border transition-colors ${
                          formData.durationMonths === d.months
                            ? 'border-accent bg-accent/10 text-foreground'
                            : 'border-input bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <div className="font-medium">{d.label}</div>
                        <div className="text-[10px]">{d.save}</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Billed £{billingTotal.toFixed(2)} every {formData.durationMonths} month{formData.durationMonths > 1 ? 's' : ''}
                    {savings > 0 ? ` • You save £${savings.toFixed(2)}` : ''}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">What happens next</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {`Start your selected plan with a 24-hour trial. After trial, billing is £${billingTotal.toFixed(2)} every ${formData.durationMonths} month${formData.durationMonths > 1 ? 's' : ''}. Message Bro right after checkout.`}
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
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
