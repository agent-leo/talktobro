import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'ok' | 'pending' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your checkout...');

  const name = useMemo(() => searchParams.get('name') || 'there', [searchParams]);
  const goal = useMemo(() => searchParams.get('goal') || '', [searchParams]);
  const plan = useMemo(() => (searchParams.get('plan') || 'starter').toUpperCase(), [searchParams]);

  useEffect(() => {
    const run = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setStatus('error');
        setMessage('Missing checkout session.');
        return;
      }

      try {
        if (!supabase) throw new Error('Supabase unavailable');

        const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
          body: { session_id: sessionId },
        });

        if (error) throw error;

        if (data?.paid) {
          setStatus('ok');
          setMessage('Payment confirmed. Your Bro access is now live.');
        } else {
          setStatus('pending');
          setMessage('Checkout received but still confirming payment. Give it 10–30 seconds then refresh.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Could not verify checkout.');
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full rounded-xl border border-border bg-secondary/20 p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            {status === 'ok' ? 'Payment confirmed ✅' : 'Checkout status'}
          </h1>

          <p className="text-muted-foreground">{message}</p>

          {(status === 'loading' || status === 'pending') && (
            <div className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              Activating your Bro account…
            </div>
          )}

          {status === 'ok' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-left">
                <p className="text-sm text-foreground"><strong>Name:</strong> {name}</p>
                <p className="text-sm text-foreground mt-1"><strong>Plan:</strong> {plan}</p>
                {goal ? <p className="text-sm text-foreground mt-1"><strong>First goal:</strong> {goal}</p> : null}
                <p className="text-xs text-muted-foreground mt-2">Your custom Bro profile is set. Reply “Hey Bro” in WhatsApp to start.</p>
              </div>

              <Button className="w-full" onClick={() => window.open('https://wa.me/447361665083?text=Hey%20Bro', '_blank')}>
                Open WhatsApp and say “Hey Bro”
              </Button>
            </div>
          )}

          {status !== 'ok' && (
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Refresh status
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Success;
