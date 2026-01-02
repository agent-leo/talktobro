import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import talktobroLogo from '@/assets/talktobro-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const Auth = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
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
      setEmailSent(true);
    }

    setIsSubmitting(false);
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
          onClick={() => navigate('/')}
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

          {!emailSent ? (
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Privacy note */}
              <p className="text-xs text-center text-muted-foreground">
                We'll send you a magic link to sign in.<br />
                No password needed.
              </p>
            </>
          ) : (
            /* Success state */
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
                onClick={() => setEmailSent(false)}
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
