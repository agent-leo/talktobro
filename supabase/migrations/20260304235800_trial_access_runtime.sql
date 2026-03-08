-- Trial access runtime controls

CREATE TABLE IF NOT EXISTS public.trial_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  message_limit INTEGER NOT NULL DEFAULT 20,
  upgrade_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view own trials" ON public.trial_access;
CREATE POLICY "Owner can view own trials"
ON public.trial_access
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can create trial access" ON public.trial_access;
CREATE POLICY "Public can create trial access"
ON public.trial_access
FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_trial_access_status_expires
  ON public.trial_access (status, expires_at);
