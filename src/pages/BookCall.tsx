import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';

type BookingSlot = {
  id?: string;
  start?: string;
  label?: string;
  iso?: string;
};

const BookCall = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [slots, setSlots] = useState<BookingSlot[]>([]);

  const bookingApiEndpoint =
    (import.meta.env.VITE_BOOKING_API_ENDPOINT as string | undefined)?.trim() ||
    ((import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
      ? `${(import.meta.env.VITE_SUPABASE_URL as string).trim()}/functions/v1/booking-api`
      : '');

  const canRequestSlots = useMemo(() => {
    return name.trim().length > 1 && /.+@.+\..+/.test(email.trim());
  }, [name, email]);

  const formatSlotLabel = (slot: BookingSlot) => {
    if (slot.label) return slot.label;
    const iso = slot.start || slot.iso;
    if (!iso) return 'Available slot';
    const date = new Date(iso);
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const fetchSlots = async () => {
    setStatusMessage(null);

    if (!bookingApiEndpoint) {
      setStatusMessage('Booking API is not configured yet. Set VITE_BOOKING_API_ENDPOINT and reload.');
      return;
    }

    setLoadingSlots(true);

    try {
      const response = await fetch(bookingApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'slots',
          name: name.trim(),
          email: email.trim(),
          durationMinutes: 15,
          source: 'talktobro-web',
        }),
      });

      if (!response.ok) {
        let reason = `Booking API error (${response.status})`;
        try {
          const errPayload = await response.json();
          if (errPayload?.error) reason = String(errPayload.error);
        } catch {
          // ignore parse failure
        }
        throw new Error(reason);
      }

      const payload = await response.json();
      const available = Array.isArray(payload?.slots) ? payload.slots : [];

      if (available.length === 0) {
        setSlots([]);
        setStatusMessage('No slots found right now. Try again in a few minutes.');
        return;
      }

      setSlots(available);
      setStatusMessage('Nice — pick a time below and we’ll lock it in.');
    } catch (err) {
      console.error('Failed to fetch booking slots', err);
      setSlots([]);
      const message = err instanceof Error ? err.message : 'Could not load slots. Please retry in a moment.';
      setStatusMessage(message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const bookSlot = async (slot: BookingSlot) => {
    setStatusMessage(null);

    if (!bookingApiEndpoint) {
      setStatusMessage('Booking API is not configured yet.');
      return;
    }

    const slotId = slot.id || slot.start || slot.iso;
    if (!slotId) {
      setStatusMessage('Invalid slot selected.');
      return;
    }

    setBookingSlotId(slotId);

    try {
      const response = await fetch(bookingApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book',
          slotId,
          slotStart: slot.start || slot.iso,
          name: name.trim(),
          email: email.trim(),
          durationMinutes: 15,
          source: 'talktobro-web',
        }),
      });

      if (!response.ok) {
        throw new Error(`Booking API error (${response.status})`);
      }

      const payload = await response.json();
      const invitedAttendee = Boolean(payload?.booking?.invitedAttendee);
      const hasMeetLink = payload?.booking?.hasMeetLink !== false;
      const meetLink = payload?.booking?.meetLink as string | undefined;

      if (invitedAttendee) {
        setStatusMessage('Booked. Check your inbox for the calendar invite.');
      } else if (hasMeetLink && meetLink) {
        setStatusMessage(`Booked. Invite sending is limited on this Google setup — use this Meet link: ${meetLink}`);
      } else {
        setStatusMessage('Booked on calendar. Invite + Meet auto-creation are limited on this Google setup.');
      }
    } catch (err) {
      console.error('Failed to book slot', err);
      setStatusMessage('Could not confirm this slot. Please try another.');
    } finally {
      setBookingSlotId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-16">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">Book a 15-minute call with the founder</h1>
            <p className="text-muted-foreground">Pick a time that works for you and we’ll confirm instantly.</p>
          </div>

          <div className="rounded-xl border border-border bg-secondary/20 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
            </div>

            <Button className="w-full" onClick={fetchSlots} disabled={!canRequestSlots || loadingSlots}>
              {loadingSlots ? 'Loading available slots...' : 'Show available slots'}
            </Button>

            {statusMessage && <p className="text-xs text-muted-foreground text-center">{statusMessage}</p>}

            {slots.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-accent" />
                  Choose a slot
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {slots.map((slot, idx) => {
                    const slotId = slot.id || slot.start || slot.iso || `slot-${idx}`;
                    const isBooking = bookingSlotId === slotId;
                    return (
                      <Button
                        key={slotId}
                        variant="outline"
                        className="justify-start"
                        onClick={() => bookSlot(slot)}
                        disabled={Boolean(bookingSlotId)}
                      >
                        {isBooking ? 'Confirming…' : formatSlotLabel(slot)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookCall;
