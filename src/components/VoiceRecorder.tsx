import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BreathingCircle } from './BreathingCircle';

type TriggerType = 'before_trade' | 'after_loss' | 'fomo' | 'panic' | 'overconfidence' | 'revenge' | 'stuck' | 'other';

interface VoiceRecorderProps {
  trigger: TriggerType;
  onComplete: () => void;
  onCancel: () => void;
}

export function VoiceRecorder({ trigger, onComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recording
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        await handleRecordingComplete(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access microphone. Please allow microphone access and try again.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const handleRecordingComplete = async (blob: Blob) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Use a matching extension for the recorded MIME type
      const mime = blob.type || 'audio/webm';
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';

      // Generate unique filename
      const filename = `${user.id}/${Date.now()}.${ext}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(filename, blob, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create voice log entry
      const { data: logData, error: logError } = await supabase
        .from('voice_logs')
        .insert({
          user_id: user.id,
          trigger_type: trigger,
          audio_url: uploadData.path,
          duration_seconds: duration,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Trigger backend processing (downloads audio from storage; avoids base64 payload limits)
      const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
        'process-voice-log',
        {
          body: {
            voiceLogId: logData.id,
          },
        }
      );

      if (transcriptError) {
        console.error('Transcription error:', transcriptError);
        toast({
          title: 'Recording saved',
          description: 'Transcription is processing in the background.',
        });
        onComplete();
        return;
      }

      if (transcriptData?.reflection) {
        setReflection(transcriptData.reflection);
      } else {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to save recording:', err);
      setError('Failed to save your recording. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show reflection if available
  if (reflection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-serif text-foreground">
              A moment to reflect
            </h2>
            <p className="text-sm text-muted-foreground">
              Here's what I heard
            </p>
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {reflection}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button onClick={onComplete} variant="primary">
              Done
            </Button>
            <Button onClick={onCancel} variant="ghost" className="text-muted-foreground">
              Start over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show processing state
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
        <BreathingCircle />
        <p className="mt-8 text-muted-foreground text-center">
          Processing your thoughts...<br />
          <span className="text-sm">Take a breath</span>
        </p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <p className="text-foreground text-center mb-6">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => setError(null)} variant="secondary">
            Try again
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 animate-fade-in">
      <div className="text-center mb-12">
        <p className="text-muted-foreground mb-2">
          {isRecording ? 'Recording...' : 'Tap to start recording'}
        </p>
        {isRecording && (
          <p className="text-2xl font-mono text-foreground">
            {formatTime(duration)}
          </p>
        )}
      </div>
      
      {/* Record button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          w-32 h-32 rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${isRecording 
            ? 'bg-destructive hover:bg-destructive/90 scale-110' 
            : 'bg-primary hover:bg-primary/90 hover:scale-105'
          }
          active:scale-95 focus:outline-none focus:ring-4 focus:ring-ring/20
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <Square className="w-12 h-12 text-destructive-foreground fill-current" />
        ) : (
          <Mic className="w-12 h-12 text-primary-foreground" />
        )}
      </button>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground max-w-xs">
          {isRecording 
            ? 'Speak your thoughts. Tap to stop when ready.'
            : "Say what's on your mind. This is just for you."
          }
        </p>
      </div>
      
      <Button 
        onClick={onCancel} 
        variant="ghost" 
        className="mt-8 text-muted-foreground"
      >
        Cancel
      </Button>
    </div>
  );
}
