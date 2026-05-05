-- Story 1.3 local hardening for confirmed authorization bypasses.
-- Production application is blocked until the connected Supabase target matches this app schema.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND is_admin = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('app.trusted_sponsorship_update', TRUE) = 'on'
    OR (SELECT public.is_admin()) THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
    OR NEW.is_admin IS DISTINCT FROM OLD.is_admin
    OR NEW.chat_banned IS DISTINCT FROM OLD.chat_banned
    OR NEW.chat_muted_until IS DISTINCT FROM OLD.chat_muted_until
    OR NEW.sponsored_by IS DISTINCT FROM OLD.sponsored_by
    OR NEW.sponsor_approved IS DISTINCT FROM OLD.sponsor_approved THEN
    RAISE EXCEPTION 'profile_sensitive_fields_admin_only'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_sensitive_profile_update ON public.profiles;

CREATE TRIGGER prevent_sensitive_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_profile_update();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sponsors can approve their sponsored users" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can update own safe profile fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE OR REPLACE FUNCTION private.prevent_sponsorship_request_identity_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF (SELECT public.is_admin()) THEN
    RETURN NEW;
  END IF;

  IF NEW.requester_id IS DISTINCT FROM OLD.requester_id
    OR NEW.sponsor_id IS DISTINCT FROM OLD.sponsor_id
    OR NEW.sponsor_handle IS DISTINCT FROM OLD.sponsor_handle
    OR NEW.attempt_number IS DISTINCT FROM OLD.attempt_number THEN
    RAISE EXCEPTION 'sponsorship_request_identity_fields_immutable'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_sponsorship_request_identity_change ON public.sponsorship_requests;

CREATE TRIGGER prevent_sponsorship_request_identity_change
  BEFORE UPDATE ON public.sponsorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_sponsorship_request_identity_change();

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

DROP TRIGGER IF EXISTS confirm_sponsorship_request ON public.sponsorship_requests;

CREATE TRIGGER confirm_sponsorship_request
  AFTER UPDATE OF status ON public.sponsorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION private.confirm_sponsorship_request();

CREATE OR REPLACE FUNCTION private.prevent_invitation_identity_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF (SELECT public.is_admin()) THEN
    RETURN NEW;
  END IF;

  IF NEW.inviter_id IS DISTINCT FROM OLD.inviter_id
    OR NEW.invited_x_handle IS DISTINCT FROM OLD.invited_x_handle THEN
    RAISE EXCEPTION 'invitation_identity_fields_immutable'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_invitation_identity_change ON public.invitations;

CREATE TRIGGER prevent_invitation_identity_change
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_invitation_identity_change();

CREATE OR REPLACE FUNCTION private.confirm_invitation_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF NEW.status = 'accepted'
    AND OLD.status IS DISTINCT FROM 'accepted' THEN
    IF NEW.accepted_by IS NULL THEN
      RAISE EXCEPTION 'invitation_acceptance_requires_user'
        USING ERRCODE = '23514';
    END IF;

    IF NEW.accepted_by IS DISTINCT FROM (SELECT auth.uid())
      AND NOT (SELECT public.is_admin()) THEN
      RAISE EXCEPTION 'invitation_acceptance_user_only'
        USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles invited
      WHERE invited.id = NEW.accepted_by
        AND invited.x_handle = OLD.invited_x_handle
    ) THEN
      RAISE EXCEPTION 'invitation_acceptance_handle_mismatch'
        USING ERRCODE = '42501';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles inviter
      WHERE inviter.id = OLD.inviter_id
        AND inviter.status = 'approved'
    ) THEN
      RAISE EXCEPTION 'invitation_inviter_not_approved'
        USING ERRCODE = '42501';
    END IF;

    PERFORM set_config('app.trusted_sponsorship_update', 'on', TRUE);

    UPDATE public.profiles
    SET sponsored_by = OLD.inviter_id,
        sponsor_approved = TRUE
    WHERE id = NEW.accepted_by;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS confirm_invitation_acceptance ON public.invitations;

CREATE TRIGGER confirm_invitation_acceptance
  AFTER UPDATE OF status ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION private.confirm_invitation_acceptance();

ALTER TABLE public.channels
  ADD COLUMN IF NOT EXISTS read_permission TEXT NOT NULL DEFAULT 'all'
    CHECK (read_permission IN ('all', 'admin_only')),
  ADD COLUMN IF NOT EXISTS write_permission TEXT NOT NULL DEFAULT 'all'
    CHECK (write_permission IN ('all', 'admin_only'));

DROP POLICY IF EXISTS "Approved users can view channels" ON public.channels;

CREATE POLICY "Approved users can view channels"
  ON public.channels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.status = 'approved'
    )
    AND (
      read_permission = 'all'
      OR (SELECT public.is_admin())
    )
    AND (
      is_private = FALSE
      OR (SELECT public.is_admin())
      OR id IN (
        SELECT cm.channel_id
        FROM public.channel_members cm
        WHERE cm.user_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "Approved users can view messages" ON public.messages;

CREATE POLICY "Approved users can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.status = 'approved'
    )
    AND EXISTS (
      SELECT 1
      FROM public.channels c
      WHERE c.id = messages.channel_id
        AND (
          c.read_permission = 'all'
          OR (SELECT public.is_admin())
        )
        AND (
          c.is_private = FALSE
          OR (SELECT public.is_admin())
          OR EXISTS (
            SELECT 1
            FROM public.channel_members cm
            WHERE cm.channel_id = messages.channel_id
              AND cm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

DROP POLICY IF EXISTS "Approved users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

CREATE OR REPLACE FUNCTION private.prevent_message_unsafe_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF (SELECT public.is_admin()) THEN
    RETURN NEW;
  END IF;

  IF NEW.channel_id IS DISTINCT FROM OLD.channel_id
    OR NEW.author_id IS DISTINCT FROM OLD.author_id
    OR NEW.image_url IS DISTINCT FROM OLD.image_url THEN
    RAISE EXCEPTION 'message_identity_and_media_fields_immutable'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_message_unsafe_update ON public.messages;

CREATE TRIGGER prevent_message_unsafe_update
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_message_unsafe_update();

CREATE POLICY "Approved users can send messages to allowed channels"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND image_url IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.status = 'approved'
        AND COALESCE(p.chat_banned, FALSE) = FALSE
        AND (p.chat_muted_until IS NULL OR p.chat_muted_until <= NOW())
    )
    AND EXISTS (
      SELECT 1
      FROM public.channels c
      WHERE c.id = messages.channel_id
        AND (
          c.write_permission = 'all'
          OR (SELECT public.is_admin())
        )
        AND (
          c.is_private = FALSE
          OR (SELECT public.is_admin())
          OR EXISTS (
            SELECT 1
            FROM public.channel_members cm
            WHERE cm.channel_id = messages.channel_id
              AND cm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR (
      author_id = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.status = 'approved'
          AND COALESCE(p.chat_banned, FALSE) = FALSE
          AND (p.chat_muted_until IS NULL OR p.chat_muted_until <= NOW())
      )
      AND EXISTS (
        SELECT 1
        FROM public.channels c
        WHERE c.id = messages.channel_id
          AND (
            c.write_permission = 'all'
            OR (SELECT public.is_admin())
          )
          AND (
            c.is_private = FALSE
            OR (SELECT public.is_admin())
            OR EXISTS (
              SELECT 1
              FROM public.channel_members cm
              WHERE cm.channel_id = messages.channel_id
                AND cm.user_id = (SELECT auth.uid())
            )
          )
      )
    )
  )
  WITH CHECK (
    (SELECT public.is_admin())
    OR (
      author_id = (SELECT auth.uid())
      AND image_url IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = (SELECT auth.uid())
          AND p.status = 'approved'
          AND COALESCE(p.chat_banned, FALSE) = FALSE
          AND (p.chat_muted_until IS NULL OR p.chat_muted_until <= NOW())
      )
      AND EXISTS (
        SELECT 1
        FROM public.channels c
        WHERE c.id = messages.channel_id
          AND (
            c.write_permission = 'all'
            OR (SELECT public.is_admin())
          )
          AND (
            c.is_private = FALSE
            OR (SELECT public.is_admin())
            OR EXISTS (
              SELECT 1
              FROM public.channel_members cm
              WHERE cm.channel_id = messages.channel_id
                AND cm.user_id = (SELECT auth.uid())
            )
          )
      )
    )
  );

DROP POLICY IF EXISTS "Approved users can create private channels" ON public.channels;
DROP POLICY IF EXISTS "Approved users can create channel memberships" ON public.channel_members;

CREATE POLICY "Admins can create channel memberships"
  ON public.channel_members FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin()));
