import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Onboarding = () => {
  const navigate = useNavigate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Normalise phone number to international format
      let phone = formData.phone.replace(/\s+/g, '');
      if (!phone.startsWith('+')) {
        if (phone.startsWith('0')) {
          phone = '+44' + phone.substring(1);
        } else {
          phone = '+' + phone;
        }
      }

      // Insert user into Supabase (if configured)
      if (supabase) {
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              name: formData.name,
              phone: phone,
              goals: formData.goals,
              experience: formData.experience,
              style: formData.style,
            }
          ])
          .select()
          .single();

        if (insertError) {
          // Check if it's a duplicate phone number
          if (insertError.code === '23505') {
            // User already exists - that's fine, let them continue
            console.log('User already exists, continuing...');
          } else {
            throw insertError;
          }
        }

        console.log('User created:', data);
      } else {
        console.log('Supabase not configured, skipping user creation');
      }
      setSubmitted(true);
      
      // Redirect to Stripe after showing success
      setTimeout(() => {
        window.open('https://buy.stripe.com/dRmcN6a1w9CEfs39QndAk01', '_blank');
      }, 2000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Something went wrong. Please try again.');
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
            <h1 className="text-2xl font-serif text-foreground mb-4">You're in!</h1>
            <p className="text-muted-foreground mb-6">
              After payment, add <strong>+447361665083</strong> to your contacts 
              and message "Hey Leo" on WhatsApp. I'll recognise your number.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to payment...
            </p>
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
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full ${
                  s <= step ? 'bg-accent' : 'bg-secondary'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Name & Phone */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">Let's get to know you</h1>
                  <p className="text-muted-foreground">So I can personalise your experience</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="What should I call you?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7XXX XXXXXX"
                    type="tel"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This is where I'll message you after you join
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.phone}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">What do you want to learn?</h1>
                  <p className="text-muted-foreground">I'll tailor our conversations to your goals</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your main goal
                  </label>
                  <Input
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="e.g. Build my own AI agent, improve prompting, set up backend integrations..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Experience with AI
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="beginner">Beginner — I use ChatGPT occasionally</option>
                    <option value="intermediate">Intermediate — I prompt daily, know the basics</option>
                    <option value="advanced">Advanced — I use AI tools heavily, want to go deeper</option>
                    <option value="builder">Builder — I want to create my own AI agent</option>
                  </select>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setStep(3)}
                  disabled={!formData.goals}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Style */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">How should I talk to you?</h1>
                  <p className="text-muted-foreground">I'll match your preferred style</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Communication style
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="direct">Direct — No fluff, just answers</option>
                    <option value="conversational">Conversational — Chat through ideas together</option>
                    <option value="technical">Technical — Deep detail, show your work</option>
                    <option value="supportive">Supportive — Encouraging, patient</option>
                  </select>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">What happens next</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        After payment, I'll add your number to my WhatsApp and you can message me anytime. 
                        Unlimited conversations, voice support, memory retention.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Continue to Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
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