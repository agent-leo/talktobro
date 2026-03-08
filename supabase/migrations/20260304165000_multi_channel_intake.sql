-- Multi-channel onboarding support (WhatsApp + Telegram)

ALTER TABLE public.onboarding_intakes
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS telegram_handle TEXT,
  ADD COLUMN IF NOT EXISTS telegram_user_id TEXT;

ALTER TABLE public.allowlist_queue
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS contact_value TEXT;

-- Backfill contact_value from legacy phone values
UPDATE public.allowlist_queue
SET contact_value = phone
WHERE contact_value IS NULL AND phone IS NOT NULL;
