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
