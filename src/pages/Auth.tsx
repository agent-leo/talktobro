import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Phone, AlertTriangle } from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string().min(10, 'Please enter a valid phone number');

type AuthMethod = 'email' | 'phone';
type AuthStep = 'input' | 'verify' | 'sent';

const Auth = () => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [authStep, setAuthStep] = useState<AuthStep>('input');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading, signIn, signInWithPhone, verifyOtp, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await signInAnonymously();

    if (error) {
      setError(error.message);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    const { error } = await signIn(email);

    if (error) {
      setError(error.message);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAuthStep('sent');
    }

    setIsSubmitting(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    const { error } = await signInWithPhone(phone);

    if (error) {
      setError(error.message);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAuthStep('verify');
    }

    setIsSubmitting(false);
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const { error } = await verifyOtp(phone, otp);

    if (error) {
      setError(error.message);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
  };

  const resetAuth = () => {
    setAuthStep('input');
    setOtp('');
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4">
        <Button 
          variant="ghost" 
          onClick={() => authStep !== 'input' ? resetAuth() : navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-sm w-full space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center">
            <img 
              src={talktobroLogo} 
              alt="TalkToBro" 
              className="h-16 mx-auto mb-6"
            />
          </div>

          {authStep === 'input' && (
            <>
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-serif text-foreground">
                  Sign in to continue
                </h1>
                <p className="text-muted-foreground">
                  Your voice logs are private to you
                </p>
              </div>

              {/* Auth Method Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'phone' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'email' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Email
                </button>
              </div>

              {authMethod === 'phone' ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                        autoComplete="tel"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      'Continue with phone'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      'Continue with email'
                    )}
                  </Button>
                </form>
              )}

              {/* Privacy note */}
              <p className="text-xs text-center text-muted-foreground">
                {authMethod === 'phone' 
                  ? "We'll send you a 6-digit code to verify your number."
                  : "Magic link sent to your inbox. No password needed."}
              </p>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Guest sign-in */}
              <Button 
                variant="outline"
                onClick={handleGuestSignIn}
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Continue as Guest'
                )}
              </Button>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Guest accounts are temporary. Your data may be lost if you clear your browser or don't link an account.
                </p>
              </div>
            </>
          )}

          {authStep === 'verify' && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-serif text-foreground">
                  Enter verification code
                </h2>
                <p className="text-muted-foreground">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-foreground">{phone}</span>
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                onClick={handleOtpVerify}
                className="w-full"
                disabled={isSubmitting || otp.length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>

              <Button 
                variant="ghost"
                onClick={resetAuth}
                className="text-muted-foreground"
              >
                Use a different number
              </Button>
            </div>
          )}

          {authStep === 'sent' && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-serif text-foreground">
                Check your inbox
              </h2>
              <p className="text-muted-foreground">
                We sent a login link to<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
              <Button 
                variant="ghost"
                onClick={resetAuth}
                className="text-muted-foreground"
              >
                Use a different email
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
