-- Fix channel_members SELECT policy recursion.
--
-- The previous "Users can view co-members in their channels" policy queried
-- public.channel_members from a policy on public.channel_members. Postgres
-- detects that as recursive RLS evaluation, and it can break public channel
-- loading because the channels policy also checks channel_members for private
-- channel visibility.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE CREATE ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_current_user_channel_member(target_channel_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members cm
    WHERE cm.channel_id = target_channel_id
      AND cm.user_id = (SELECT auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION private.is_current_user_channel_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_current_user_channel_member(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can view co-members in their channels"
  ON public.channel_members;

CREATE POLICY "Users can view co-members in their channels"
  ON public.channel_members FOR SELECT
  TO authenticated
  USING ((SELECT private.is_current_user_channel_member(channel_id)));
