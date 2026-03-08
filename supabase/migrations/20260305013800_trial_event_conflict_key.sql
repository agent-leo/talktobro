-- Ensure PostgREST on_conflict has a concrete unique constraint

DROP INDEX IF EXISTS public.ux_trial_message_events_hash;

ALTER TABLE public.trial_message_events
  ADD CONSTRAINT uq_trial_message_events_event_hash UNIQUE (event_hash);
