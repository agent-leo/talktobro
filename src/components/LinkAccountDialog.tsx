import { useState } from 'react';
import { Mail, Phone, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const phoneSchema = z.string().min(10, 'Please enter a valid phone number');

type LinkMethod = 'email' | 'phone';
type LinkStep = 'input' | 'verify' | 'sent';

interface LinkAccountDialogProps {
  trigger?: React.ReactNode;
}

export function LinkAccountDialog({ trigger }: LinkAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [linkMethod, setLinkMethod] = useState<LinkMethod>('phone');
  const [linkStep, setLinkStep] = useState<LinkStep>('input');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { linkEmail, linkPhone, verifyPhoneLink } = useAuth();
  const { toast } = useToast();

  const resetDialog = () => {
    setLinkStep('input');
    setEmail('');
    setPhone('');
    setOtp('');
    setError(null);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetDialog();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    const { error } = await linkEmail(email);

    if (error) {
      setError(error.message);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setLinkStep('sent');
      toast({
        title: "Confirmation email sent",
        description: "Check your inbox to confirm your email address.",
      });
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

    const { error } = await linkPhone(phone);

    if (error) {
      setError(error.message);
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setLinkStep('verify');
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

    const { error } = await verifyPhoneLink(phone, otp);

    if (error) {
      setError(error.message);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account linked!",
        description: "Your guest account is now permanent.",
      });
      handleClose(false);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Link Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Link your account</DialogTitle>
          <DialogDescription>
            Upgrade your guest account to keep your data permanently.
          </DialogDescription>
        </DialogHeader>

        {linkStep === 'input' && (
          <div className="space-y-4">
            {/* Method Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setLinkMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  linkMethod === 'phone' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => setLinkMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  linkMethod === 'email' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Email
              </button>
            </div>

            {linkMethod === 'phone' ? (
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
                    'Link with phone'
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
                    'Link with email'
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        {linkStep === 'verify' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Enter verification code</h3>
              <p className="text-sm text-muted-foreground">
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
                'Verify & Link'
              )}
            </Button>

            <Button 
              variant="ghost"
              onClick={resetDialog}
              className="text-muted-foreground"
            >
              Use a different number
            </Button>
          </div>
        )}

        {linkStep === 'sent' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-medium">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to permanently link your account.
            </p>
            <Button 
              variant="ghost"
              onClick={resetDialog}
              className="text-muted-foreground"
            >
              Use a different email
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}