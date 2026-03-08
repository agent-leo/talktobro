-- ON CONFLICT in RPC needs concrete unique constraints

DROP INDEX IF EXISTS public.ux_onboarding_intakes_request_id;
DROP INDEX IF EXISTS public.ux_trial_access_request_id;
DROP INDEX IF EXISTS public.ux_allowlist_queue_request_id;

ALTER TABLE public.onboarding_intakes
  ADD CONSTRAINT uq_onboarding_intakes_request_id UNIQUE (request_id);

ALTER TABLE public.trial_access
  ADD CONSTRAINT uq_trial_access_request_id UNIQUE (request_id);

ALTER TABLE public.allowlist_queue
  ADD CONSTRAINT uq_allowlist_queue_request_id UNIQUE (request_id);
