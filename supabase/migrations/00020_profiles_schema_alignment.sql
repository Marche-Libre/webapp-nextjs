-- Align profiles schema with application expectations

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accept_referrals BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS specialty_category_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS chat_muted_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS chat_banned BOOLEAN DEFAULT FALSE;

UPDATE public.profiles
SET accept_referrals = TRUE
WHERE accept_referrals IS NULL;

UPDATE public.profiles
SET chat_banned = FALSE
WHERE chat_banned IS NULL;

UPDATE public.profiles
SET specialty_category_ids = ARRAY[specialty_category_id]
WHERE specialty_category_id IS NOT NULL
  AND (specialty_category_ids IS NULL OR cardinality(specialty_category_ids) = 0);
