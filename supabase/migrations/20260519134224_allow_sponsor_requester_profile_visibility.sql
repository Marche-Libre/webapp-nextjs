-- Allow sponsors to identify pending requesters for sponsorship requests
-- addressed to them. This keeps profile sensitive writes locked down while
-- making `/parrainages` usable before trusted sponsor confirmation runs.

DROP POLICY IF EXISTS "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles;

CREATE POLICY "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sponsorship_requests sr
      WHERE sr.requester_id = profiles.id
        AND sr.sponsor_id = (SELECT auth.uid())
    )
  );
