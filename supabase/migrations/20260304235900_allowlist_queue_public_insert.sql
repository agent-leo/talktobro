-- allow onboarding to queue trial provisioning

DROP POLICY IF EXISTS "Public can queue allowlist" ON public.allowlist_queue;
CREATE POLICY "Public can queue allowlist"
ON public.allowlist_queue
FOR INSERT
WITH CHECK (true);
