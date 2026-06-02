CREATE OR REPLACE FUNCTION private.confirm_sponsorship_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF NEW.status = 'approved'
    AND OLD.status IS DISTINCT FROM 'approved' THEN
    IF OLD.sponsor_id IS NULL THEN
      RAISE EXCEPTION 'sponsorship_request_requires_sponsor'
        USING ERRCODE = '23514';
    END IF;

    IF OLD.sponsor_id IS DISTINCT FROM (SELECT auth.uid())
      AND NOT (SELECT public.is_admin()) THEN
      RAISE EXCEPTION 'sponsorship_request_sponsor_only'
        USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = OLD.sponsor_id
        AND p.status = 'approved'
    ) THEN
      RAISE EXCEPTION 'sponsorship_request_sponsor_not_approved'
        USING ERRCODE = '42501';
    END IF;

    PERFORM set_config('app.trusted_sponsorship_update', 'on', TRUE);

    UPDATE public.profiles
    SET sponsored_by = OLD.sponsor_id,
        sponsor_approved = TRUE
    WHERE id = OLD.requester_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.prevent_profile_approval_without_confirmed_sponsor()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'approved'
    AND OLD.status IS DISTINCT FROM 'approved'
    AND (
      NEW.sponsored_by IS NULL
      OR NEW.sponsor_approved IS NOT TRUE
    ) THEN
    RAISE EXCEPTION 'profile_approval_requires_confirmed_sponsor'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_approval_without_confirmed_sponsor ON public.profiles;

CREATE TRIGGER prevent_profile_approval_without_confirmed_sponsor
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_profile_approval_without_confirmed_sponsor();

ALTER TABLE public.sponsorship_requests
  DROP CONSTRAINT IF EXISTS sponsorship_requests_attempt_number_check;

ALTER TABLE public.sponsorship_requests
  ADD CONSTRAINT sponsorship_requests_attempt_number_positive_check
  CHECK (attempt_number >= 1);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsorship_requests_one_active_per_requester
  ON public.sponsorship_requests (requester_id)
  WHERE status IN ('pending', 'approved');
