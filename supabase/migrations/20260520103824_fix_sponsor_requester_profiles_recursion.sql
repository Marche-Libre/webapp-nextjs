-- Replace the recursive sponsor requester profile visibility policy with a
-- scoped RPC. The old policy queried sponsorship_requests from profiles RLS,
-- while sponsorship_requests admin policies query profiles, causing 42P17.

DROP POLICY IF EXISTS "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles;

CREATE SCHEMA IF NOT EXISTS private;

REVOKE CREATE ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.get_sponsor_requester_profiles()
RETURNS TABLE (
  sponsorship_request_id UUID,
  requester_id UUID,
  x_handle TEXT,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    sr.id AS sponsorship_request_id,
    p.id AS requester_id,
    p.x_handle,
    p.full_name,
    p.avatar_url
  FROM public.sponsorship_requests sr
  JOIN public.profiles p
    ON p.id = sr.requester_id
  WHERE sr.sponsor_id = (SELECT auth.uid())
    AND (SELECT auth.uid()) IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION private.get_sponsor_requester_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.get_sponsor_requester_profiles() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_sponsor_requester_profiles()
RETURNS TABLE (
  sponsorship_request_id UUID,
  requester_id UUID,
  x_handle TEXT,
  full_name TEXT,
  avatar_url TEXT
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT *
  FROM private.get_sponsor_requester_profiles();
$$;

REVOKE ALL ON FUNCTION public.get_sponsor_requester_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_sponsor_requester_profiles() TO authenticated;
