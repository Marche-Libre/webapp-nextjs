-- Harden admission status updates on profiles.
--
-- Existing profile UPDATE policies allowed broad row updates for a user's own
-- profile and for sponsored users. Because admission state lives on
-- public.profiles.status, those policies could let non-admin users bypass admin
-- review unless status remains unchanged.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

DROP FUNCTION IF EXISTS private.profile_admission_fields_unchanged(UUID, TEXT, BOOLEAN, UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION private.profile_admission_fields_unchanged(
  profile_id UUID,
  new_x_handle TEXT,
  new_status TEXT,
  new_is_admin BOOLEAN,
  new_sponsored_by UUID,
  new_sponsor_approved BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = profile_id
      AND profile_id = auth.uid()
      AND p.x_handle IS NOT DISTINCT FROM new_x_handle
      AND p.status IS NOT DISTINCT FROM new_status
      AND p.is_admin IS NOT DISTINCT FROM new_is_admin
      AND p.sponsored_by IS NOT DISTINCT FROM new_sponsored_by
      AND p.sponsor_approved IS NOT DISTINCT FROM new_sponsor_approved
  );
$$;

REVOKE ALL ON FUNCTION private.profile_admission_fields_unchanged(UUID, TEXT, TEXT, BOOLEAN, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.profile_admission_fields_unchanged(UUID, TEXT, TEXT, BOOLEAN, UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION private.has_sponsorship_request_for_profile(
  profile_id UUID,
  sponsor_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sponsorship_requests sr
    JOIN public.profiles sponsor ON sponsor.id = sr.sponsor_id
    WHERE sr.requester_id = profile_id
      AND sr.sponsor_id = sponsor_profile_id
      AND sr.requester_id IS DISTINCT FROM sr.sponsor_id
      AND sponsor_profile_id = auth.uid()
      AND sponsor.status = 'approved'
      AND LOWER(BTRIM(sponsor.x_handle)) = LOWER(BTRIM(sr.sponsor_handle))
      AND sr.status IN ('pending', 'approved')
  );
$$;

REVOKE ALL ON FUNCTION private.has_sponsorship_request_for_profile(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_sponsorship_request_for_profile(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION private.has_approved_sponsorship_request_for_profile(
  profile_id UUID,
  sponsor_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sponsorship_requests sr
    JOIN public.profiles sponsor ON sponsor.id = sr.sponsor_id
    WHERE sr.requester_id = profile_id
      AND sr.sponsor_id = sponsor_profile_id
      AND sr.requester_id IS DISTINCT FROM sr.sponsor_id
      AND sponsor_profile_id = auth.uid()
      AND sponsor.status = 'approved'
      AND LOWER(BTRIM(sponsor.x_handle)) = LOWER(BTRIM(sr.sponsor_handle))
      AND sr.status = 'approved'
  );
$$;

REVOKE ALL ON FUNCTION private.has_approved_sponsorship_request_for_profile(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_approved_sponsorship_request_for_profile(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION private.profile_only_sponsor_confirmation_changed(
  new_profile public.profiles
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = new_profile.id
      AND private.has_approved_sponsorship_request_for_profile(new_profile.id, auth.uid())
      AND (
        to_jsonb(p) - 'sponsored_by' - 'sponsor_approved' - 'updated_at'
      ) = (
        to_jsonb(new_profile) - 'sponsored_by' - 'sponsor_approved' - 'updated_at'
      )
  );
$$;

REVOKE ALL ON FUNCTION private.profile_only_sponsor_confirmation_changed(public.profiles) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.profile_only_sponsor_confirmation_changed(public.profiles) TO authenticated;

CREATE OR REPLACE FUNCTION private.profile_only_invitation_sponsor_confirmation_changed(
  new_profile public.profiles
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = new_profile.id
      AND p.id = auth.uid()
      AND (
        to_jsonb(p) - 'sponsored_by' - 'sponsor_approved' - 'updated_at'
      ) = (
        to_jsonb(new_profile) - 'sponsored_by' - 'sponsor_approved' - 'updated_at'
      )
  );
$$;

REVOKE ALL ON FUNCTION private.profile_only_invitation_sponsor_confirmation_changed(public.profiles) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.profile_only_invitation_sponsor_confirmation_changed(public.profiles) TO authenticated;

CREATE OR REPLACE FUNCTION private.sponsorship_request_only_status_changed(
  new_request public.sponsorship_requests
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sponsorship_requests sr
    WHERE sr.id = new_request.id
      AND sr.sponsor_id = auth.uid()
      AND (
        to_jsonb(sr) - 'status' - 'updated_at'
      ) = (
        to_jsonb(new_request) - 'status' - 'updated_at'
      )
  );
$$;

REVOKE ALL ON FUNCTION private.sponsorship_request_only_status_changed(public.sponsorship_requests) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.sponsorship_request_only_status_changed(public.sponsorship_requests) TO authenticated;

CREATE OR REPLACE FUNCTION private.has_accepted_invitation_for_profile(
  profile_id UUID,
  sponsor_profile_id UUID,
  profile_x_handle TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations inv
    JOIN public.profiles inviter ON inviter.id = inv.inviter_id
    WHERE inv.accepted_by = profile_id
      AND profile_id = auth.uid()
      AND inv.inviter_id = sponsor_profile_id
      AND inv.inviter_id IS DISTINCT FROM inv.accepted_by
      AND inviter.status = 'approved'
      AND LOWER(BTRIM(inv.invited_x_handle)) = LOWER(BTRIM(profile_x_handle))
      AND inv.status = 'accepted'
      AND NOT EXISTS (
        SELECT 1
        FROM public.profiles dup
        WHERE dup.id <> profile_id
          AND LOWER(BTRIM(dup.x_handle)) = LOWER(BTRIM(profile_x_handle))
      )
  );
$$;

REVOKE ALL ON FUNCTION private.has_accepted_invitation_for_profile(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_accepted_invitation_for_profile(UUID, UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION private.invitation_identity_fields_unchanged(
  invitation_id UUID,
  new_inviter_id UUID,
  new_invited_x_handle TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations inv
    WHERE inv.id = invitation_id
      AND LOWER(BTRIM(inv.invited_x_handle)) = (
        SELECT LOWER(BTRIM(x_handle)) FROM public.profiles WHERE id = auth.uid()
      )
      AND inv.inviter_id IS NOT DISTINCT FROM new_inviter_id
      AND inv.invited_x_handle IS NOT DISTINCT FROM new_invited_x_handle
  );
$$;

REVOKE ALL ON FUNCTION private.invitation_identity_fields_unchanged(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.invitation_identity_fields_unchanged(UUID, UUID, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Approved users can create invitations" ON public.invitations;
CREATE POLICY "Approved users can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    inviter_id = auth.uid()
    AND status = 'pending'
    AND accepted_by IS NULL
    AND NULLIF(BTRIM(invited_x_handle), '') IS NOT NULL
    AND LOWER(BTRIM(invited_x_handle)) <> (
      SELECT LOWER(BTRIM(x_handle)) FROM public.profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Invited users can update invitation status" ON public.invitations;
CREATE POLICY "Invited users can update invitation status"
  ON public.invitations FOR UPDATE
  USING (
    (
      LOWER(BTRIM(invited_x_handle)) = (
        SELECT LOWER(BTRIM(x_handle)) FROM public.profiles WHERE id = auth.uid()
      )
      AND status = 'pending'
    )
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR (
      LOWER(BTRIM(invited_x_handle)) = (
        SELECT LOWER(BTRIM(x_handle)) FROM public.profiles WHERE id = auth.uid()
      )
      AND private.invitation_identity_fields_unchanged(id, inviter_id, invited_x_handle)
      AND (
        (status = 'accepted' AND accepted_by = auth.uid())
        OR (status = 'rejected' AND accepted_by IS NULL)
      )
    )
  );

DROP POLICY IF EXISTS "Requesters can create requests" ON public.sponsorship_requests;
CREATE POLICY "Requesters can create requests"
  ON public.sponsorship_requests FOR INSERT
  WITH CHECK (
    requester_id = auth.uid()
    AND status = 'pending'
    AND sponsor_id IS NOT NULL
    AND sponsor_id IS DISTINCT FROM auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles sponsor
      WHERE sponsor.id = sponsor_id
        AND sponsor.status = 'approved'
        AND LOWER(BTRIM(sponsor.x_handle)) = LOWER(BTRIM(sponsor_handle))
    )
  );

DROP POLICY IF EXISTS "Sponsors can update requests for them" ON public.sponsorship_requests;
CREATE POLICY "Sponsors can update requests for them"
  ON public.sponsorship_requests FOR UPDATE
  USING (
    sponsor_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    sponsor_id = auth.uid()
    AND status IN ('approved', 'rejected')
    AND private.sponsorship_request_only_status_changed(sponsorship_requests)
  );

DROP POLICY IF EXISTS "Sponsors can view requester profiles for sponsorship requests" ON public.profiles;
CREATE POLICY "Sponsors can view requester profiles for sponsorship requests"
  ON public.profiles FOR SELECT
  USING (private.has_sponsorship_request_for_profile(id, auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND private.profile_admission_fields_unchanged(
      id,
      x_handle,
      status,
      is_admin,
      sponsored_by,
      sponsor_approved
    )
  );

DROP POLICY IF EXISTS "Sponsors can approve their sponsored users" ON public.profiles;
CREATE POLICY "Sponsors can approve their sponsored users"
  ON public.profiles FOR UPDATE
  USING (private.has_sponsorship_request_for_profile(id, auth.uid()))
  WITH CHECK (
    sponsored_by = auth.uid()
    AND sponsor_approved = TRUE
    AND private.profile_only_sponsor_confirmation_changed(profiles)
    AND private.has_sponsorship_request_for_profile(id, auth.uid())
  );

DROP POLICY IF EXISTS "Invited users can attach accepted invitation sponsor" ON public.profiles;
CREATE POLICY "Invited users can attach accepted invitation sponsor"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND sponsored_by IS DISTINCT FROM auth.uid()
    AND sponsor_approved = TRUE
    AND private.profile_only_invitation_sponsor_confirmation_changed(profiles)
    AND private.has_accepted_invitation_for_profile(id, sponsored_by, x_handle)
  );
