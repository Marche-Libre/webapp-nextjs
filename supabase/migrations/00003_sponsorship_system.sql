-- Sponsorship / referral system
-- Each user gets a unique referral code. New members must be sponsored by an existing member.
-- The sponsor must approve the new member before admin can finalize.

-- Add sponsorship fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS sponsored_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS sponsor_approved BOOLEAN DEFAULT FALSE;

-- Generate a short referral code for existing users
UPDATE public.profiles
SET referral_code = UPPER(SUBSTR(MD5(id::text || NOW()::text), 1, 8))
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL after backfill
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;

-- Update handle_new_user to generate referral codes and link sponsors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _x_handle TEXT;
  _avatar_url TEXT;
  _referral_code TEXT;
  _sponsor_id UUID;
  _sponsor_referral TEXT;
BEGIN
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  _x_handle := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'x_handle', ''),
    NULLIF(NEW.raw_user_meta_data->>'user_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'preferred_username', ''),
    ''
  );

  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Generate unique referral code
  _referral_code := UPPER(SUBSTR(MD5(NEW.id::text || NOW()::text), 1, 8));

  -- Look up sponsor by referral code
  _sponsor_referral := NULLIF(NEW.raw_user_meta_data->>'sponsor_code', '');
  IF _sponsor_referral IS NOT NULL THEN
    SELECT id INTO _sponsor_id
    FROM public.profiles
    WHERE referral_code = UPPER(_sponsor_referral)
      AND status = 'approved';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, x_handle, avatar_url, referral_code, sponsored_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    _full_name,
    _x_handle,
    _avatar_url,
    _referral_code,
    _sponsor_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: sponsors can see their sponsored users
CREATE POLICY "Sponsors can view their sponsored users"
  ON public.profiles FOR SELECT
  USING (sponsored_by = auth.uid());

-- Policy: sponsors can update sponsor_approved for their sponsored users
CREATE POLICY "Sponsors can approve their sponsored users"
  ON public.profiles FOR UPDATE
  USING (sponsored_by = auth.uid())
  WITH CHECK (sponsored_by = auth.uid());
