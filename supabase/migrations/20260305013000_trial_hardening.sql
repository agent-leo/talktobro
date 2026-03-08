-- Hardening: deterministic onboarding transaction + event-accurate trial metering

ALTER TABLE public.onboarding_intakes
  ADD COLUMN IF NOT EXISTS request_id TEXT;

ALTER TABLE public.onboarding_intakes
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.allowlist_queue
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE public.trial_access
  ADD COLUMN IF NOT EXISTS request_id TEXT;

ALTER TABLE public.allowlist_queue
  ADD COLUMN IF NOT EXISTS request_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_onboarding_intakes_request_id
  ON public.onboarding_intakes(request_id)
  WHERE request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_trial_access_request_id
  ON public.trial_access(request_id)
  WHERE request_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_allowlist_queue_request_id
  ON public.allowlist_queue(request_id)
  WHERE request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.trial_message_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID REFERENCES public.trial_access(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  message_id TEXT,
  direction TEXT NOT NULL DEFAULT 'user',
  event_at TIMESTAMPTZ NOT NULL,
  event_hash TEXT,
  raw_line TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_message_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view own trial events" ON public.trial_message_events;
CREATE POLICY "Owner can view own trial events"
ON public.trial_message_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.trial_access t
    WHERE t.id = trial_message_events.trial_id
      AND t.user_id = auth.uid()
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_trial_message_events_key
  ON public.trial_message_events(channel, contact_value, message_id)
  WHERE message_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_trial_message_events_hash
  ON public.trial_message_events(event_hash)
  WHERE event_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trial_message_events_lookup
  ON public.trial_message_events(channel, contact_value, event_at DESC);

CREATE OR REPLACE FUNCTION public.activate_trial_onboarding(
  p_request_id TEXT,
  p_user_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_preferred_channel TEXT,
  p_telegram_handle TEXT,
  p_telegram_user_id TEXT,
  p_goals TEXT,
  p_experience TEXT,
  p_style TEXT,
  p_checkout_url TEXT,
  p_message_limit INTEGER DEFAULT 20,
  p_trial_hours INTEGER DEFAULT 24
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_channel TEXT;
  v_contact TEXT;
  v_expires_at TIMESTAMPTZ;
  v_intake_id UUID;
  v_trial_id UUID;
  v_queue_id UUID;
BEGIN
  IF p_request_id IS NULL OR length(trim(p_request_id)) = 0 THEN
    RAISE EXCEPTION 'request_id is required';
  END IF;

  v_channel := COALESCE(NULLIF(trim(lower(p_preferred_channel)), ''), 'whatsapp');
  IF v_channel NOT IN ('whatsapp', 'telegram') THEN
    RAISE EXCEPTION 'preferred_channel must be whatsapp or telegram';
  END IF;

  v_contact := CASE
    WHEN v_channel = 'telegram' THEN NULLIF(trim(p_telegram_user_id), '')
    ELSE NULLIF(trim(p_phone), '')
  END;

  IF v_contact IS NULL THEN
    RAISE EXCEPTION 'contact value is required for chosen channel';
  END IF;

  v_expires_at := now() + make_interval(hours => GREATEST(COALESCE(p_trial_hours, 24), 1));

  INSERT INTO public.onboarding_intakes (
    request_id,
    user_id,
    name,
    phone,
    preferred_channel,
    telegram_handle,
    telegram_user_id,
    goals,
    experience,
    style,
    checkout_status
  )
  VALUES (
    p_request_id,
    p_user_id,
    NULLIF(trim(p_name), ''),
    p_phone,
    v_channel,
    NULLIF(trim(p_telegram_handle), ''),
    NULLIF(trim(p_telegram_user_id), ''),
    p_goals,
    p_experience,
    p_style,
    'pending'
  )
  ON CONFLICT (request_id) DO UPDATE SET request_id = EXCLUDED.request_id
  RETURNING id INTO v_intake_id;

  INSERT INTO public.trial_access (
    request_id,
    user_id,
    channel,
    contact_value,
    status,
    started_at,
    expires_at,
    message_limit,
    upgrade_url,
    notes
  )
  VALUES (
    p_request_id,
    p_user_id,
    v_channel,
    v_contact,
    'active',
    now(),
    v_expires_at,
    GREATEST(COALESCE(p_message_limit, 20), 1),
    p_checkout_url,
    'onboarding instant trial'
  )
  ON CONFLICT (request_id) DO UPDATE SET request_id = EXCLUDED.request_id
  RETURNING id INTO v_trial_id;

  INSERT INTO public.allowlist_queue (
    request_id,
    user_id,
    channel,
    contact_value,
    phone,
    source,
    status,
    reason
  )
  VALUES (
    p_request_id,
    p_user_id,
    v_channel,
    v_contact,
    p_phone,
    'onboarding_trial',
    'pending',
    'instant trial activation'
  )
  ON CONFLICT (request_id) DO UPDATE
    SET status = 'pending', processed_at = NULL
  RETURNING id INTO v_queue_id;

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', p_request_id,
    'intake_id', v_intake_id,
    'trial_id', v_trial_id,
    'queue_id', v_queue_id,
    'channel', v_channel,
    'contact_value', v_contact,
    'expires_at', v_expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_trial_onboarding(
  TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER
) TO anon, authenticated, service_role;
