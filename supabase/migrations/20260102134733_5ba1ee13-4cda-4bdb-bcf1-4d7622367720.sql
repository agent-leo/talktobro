-- Create trigger_type enum for voice logs
CREATE TYPE public.trigger_type AS ENUM (
  'before_trade',
  'after_loss',
  'fomo',
  'panic',
  'overconfidence',
  'revenge',
  'stuck',
  'other'
);

-- Create voice_logs table for decision ledger
CREATE TABLE public.voice_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trigger_type trigger_type NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  reflection_summary TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.voice_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own voice logs (excluding soft-deleted)
CREATE POLICY "Users can view their own voice logs"
ON public.voice_logs
FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can create their own voice logs
CREATE POLICY "Users can create their own voice logs"
ON public.voice_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own voice logs
CREATE POLICY "Users can update their own voice logs"
ON public.voice_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can soft-delete their own voice logs
CREATE POLICY "Users can delete their own voice logs"
ON public.voice_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create private storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/wav']
);

-- Storage policies for voice recordings
CREATE POLICY "Users can upload their own voice recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own voice recordings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice recordings"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);