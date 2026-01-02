import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Trash2, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VoiceLog {
  id: string;
  created_at: string;
  trigger_type: string;
  audio_url: string | null;
  transcript: string | null;
  reflection_summary: string | null;
  duration_seconds: number | null;
}

const triggerLabels: Record<string, string> = {
  before_trade: 'Before a trade',
  after_loss: 'After a loss',
  fomo: 'FOMO',
  panic: 'Panic',
  overconfidence: 'Overconfident',
  revenge: 'Revenge trading',
  stuck: 'Stuck',
  other: 'Other',
};

const Ledger = () => {
  const [logs, setLogs] = useState<VoiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch voice logs
  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('voice_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch logs:', error);
      toast({
        title: "Error",
        description: "Failed to load your voice logs",
        variant: "destructive"
      });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const playAudio = async (log: VoiceLog) => {
    if (!log.audio_url) return;

    if (playingId === log.id) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Get signed URL
    const { data, error } = await supabase.storage
      .from('voice-recordings')
      .createSignedUrl(log.audio_url, 3600);

    if (error || !data) {
      toast({
        title: "Error",
        description: "Could not play audio",
        variant: "destructive"
      });
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Play new audio
    const audio = new Audio(data.signedUrl);
    audioRef.current = audio;
    
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => {
      setPlayingId(null);
      toast({
        title: "Error",
        description: "Could not play audio",
        variant: "destructive"
      });
    };

    audio.play();
    setPlayingId(log.id);
  };

  const deleteLog = async () => {
    if (!deleteId) return;

    const log = logs.find(l => l.id === deleteId);
    if (!log) return;

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('voice_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive"
      });
    } else {
      setLogs(logs.filter(l => l.id !== deleteId));
      toast({
        title: "Deleted",
        description: "Voice log removed",
      });
    }

    setDeleteId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-serif text-foreground mb-2">
            Your decision ledger
          </h1>
          <p className="text-muted-foreground">
            A private record of moments you paused
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-6">
              No voice logs yet.<br />
              Your reflections will appear here.
            </p>
            <Button onClick={() => navigate('/record')} variant="primary">
              Record your first
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className="bg-card border border-border rounded-lg p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground mb-2">
                      {triggerLabels[log.trigger_type] || log.trigger_type}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                      {log.duration_seconds && (
                        <span className="ml-2">· {formatDuration(log.duration_seconds)}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {log.audio_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playAudio(log)}
                        className="h-9 w-9"
                      >
                        {playingId === log.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(log.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Reflection summary */}
                {log.reflection_summary && (
                  <div 
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <p className={`text-foreground leading-relaxed ${expandedId !== log.id ? 'line-clamp-3' : ''}`}>
                      {log.reflection_summary}
                    </p>
                    {log.reflection_summary.length > 200 && (
                      <button className="text-sm text-muted-foreground hover:text-foreground mt-1">
                        {expandedId === log.id ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Transcript (expandable) */}
                {expandedId === log.id && log.transcript && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase mb-2">Transcript</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {log.transcript}
                    </p>
                  </div>
                )}

                {/* Processing indicator */}
                {!log.reflection_summary && !log.transcript && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* New recording button */}
        {logs.length > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/record')} variant="primary">
              New recording
            </Button>
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this voice log?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this recording and reflection from your ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLog} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ledger;
