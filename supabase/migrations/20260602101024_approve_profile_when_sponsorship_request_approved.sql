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
        sponsor_approved = TRUE,
        status = 'approved'
    WHERE id = OLD.requester_id;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  PERFORM set_config('app.trusted_sponsorship_update', 'on', TRUE);

  UPDATE public.profiles p
  SET sponsored_by = sr.sponsor_id,
      sponsor_approved = TRUE,
      status = 'approved'
  FROM public.sponsorship_requests sr
  JOIN public.profiles sponsor
    ON sponsor.id = sr.sponsor_id
    AND sponsor.status = 'approved'
  WHERE p.id = sr.requester_id
    AND p.status = 'pending'
    AND sr.status = 'approved'
    AND sr.sponsor_id IS NOT NULL;
END;
$$;
