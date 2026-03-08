-- Subscription + onboarding + allowlist pipeline

-- Profiles linked to auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT UNIQUE,
  goals TEXT,
  experience TEXT,
  style TEXT,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stripe-backed subscription state
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Intake records captured before checkout
CREATE TABLE IF NOT EXISTS public.onboarding_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  phone TEXT NOT NULL,
  goals TEXT,
  experience TEXT,
  style TEXT,
  checkout_status TEXT NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queue to drive OpenClaw allowlist updates post-payment
CREATE TABLE IF NOT EXISTS public.allowlist_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'stripe_webhook',
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowlist_queue ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
CREATE POLICY "Profiles are editable by owner"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profiles can be created by owner" ON public.profiles;
CREATE POLICY "Profiles can be created by owner"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Subscriptions are viewable by owner" ON public.subscriptions;
CREATE POLICY "Subscriptions are viewable by owner"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Intakes policies: allow public insert (onboarding before auth), owner can view own
DROP POLICY IF EXISTS "Public can create onboarding intake" ON public.onboarding_intakes;
CREATE POLICY "Public can create onboarding intake"
ON public.onboarding_intakes
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Owner can view onboarding intake" ON public.onboarding_intakes;
CREATE POLICY "Owner can view onboarding intake"
ON public.onboarding_intakes
FOR SELECT
USING (auth.uid() = user_id);

-- Allowlist queue is service-managed only; users can view their own entries
DROP POLICY IF EXISTS "Owner can view own allowlist queue" ON public.allowlist_queue;
CREATE POLICY "Owner can view own allowlist queue"
ON public.allowlist_queue
FOR SELECT
USING (auth.uid() = user_id);
