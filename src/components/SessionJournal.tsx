import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface SessionJournalProps {
  flowId: string;
  onClose: () => void;
}

interface JournalEntry {
  id: string;
  flowId: string;
  content: string;
  timestamp: string;
}

export function SessionJournal({ flowId, onClose }: SessionJournalProps) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!note.trim()) {
      onClose();
      return;
    }

    const entry: JournalEntry = {
      id: `${Date.now()}`,
      flowId,
      content: note.trim().slice(0, 2000), // Limit to 2000 chars
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('bro-journal');
      const entries: JournalEntry[] = existing ? JSON.parse(existing) : [];
      entries.push(entry);
      // Keep only last 50 entries
      const trimmed = entries.slice(-50);
      localStorage.setItem('bro-journal', JSON.stringify(trimmed));
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch {
      // localStorage might be full or disabled
      onClose();
    }
  };

  if (saved) {
    return (
      <div className="animate-fade-in text-center py-4">
        <p className="text-muted-foreground">Saved privately to this device.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Want to note anything for yourself? This stays on your device only.
        </p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 2000))}
          placeholder="What's on your mind..."
          className="min-h-[100px] bg-secondary/30 border-border/50 resize-none focus:border-accent/50"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground/60 text-right">
          {note.length}/2000
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          variant="default"
          onClick={handleSave}
          className="flex-1"
        >
          {note.trim() ? 'Save note' : 'Done'}
        </Button>
      </div>
    </div>
  );
}
