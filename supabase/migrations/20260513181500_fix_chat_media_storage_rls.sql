-- Evaluate chat media storage access with a private SECURITY DEFINER helper.
-- Storage policies run while inserting storage.objects rows; querying public
-- channel tables directly from those policies can be blocked by their own RLS.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE CREATE ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.can_current_user_access_chat_media_path(
  object_name TEXT,
  access_mode TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
DECLARE
  channel_id_value UUID;
  current_user_id UUID;
  object_owner_id UUID;
  current_user_is_admin BOOLEAN;
BEGIN
  current_user_id := (SELECT auth.uid());

  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF access_mode NOT IN ('read', 'write', 'delete') THEN
    RETURN FALSE;
  END IF;

  IF split_part(object_name, '/', 1) <> 'chat'
    OR split_part(object_name, '/', 2) = ''
    OR split_part(object_name, '/', 3) = ''
    OR split_part(object_name, '/', 4) = '' THEN
    RETURN FALSE;
  END IF;

  BEGIN
    channel_id_value := split_part(object_name, '/', 2)::UUID;
    object_owner_id := split_part(object_name, '/', 3)::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN FALSE;
  END;

  current_user_is_admin := (SELECT public.is_admin());

  IF access_mode = 'write' AND object_owner_id IS DISTINCT FROM current_user_id THEN
    RETURN FALSE;
  END IF;

  IF access_mode = 'delete'
    AND object_owner_id IS DISTINCT FROM current_user_id
    AND NOT current_user_is_admin THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.channels c
    JOIN public.profiles p ON p.id = current_user_id
    WHERE c.id = channel_id_value
      AND p.status = 'approved'
      AND (
        access_mode <> 'write'
        OR (
          COALESCE(p.chat_banned, FALSE) = FALSE
          AND (p.chat_muted_until IS NULL OR p.chat_muted_until <= NOW())
        )
      )
      AND (
        current_user_is_admin
        OR (
          CASE
            WHEN access_mode = 'write' THEN c.write_permission = 'all'
            ELSE c.read_permission = 'all'
          END
        )
      )
      AND (
        c.is_private = FALSE
        OR current_user_is_admin
        OR EXISTS (
          SELECT 1
          FROM public.channel_members cm
          WHERE cm.channel_id = channel_id_value
            AND cm.user_id = current_user_id
        )
      )
  );
END;
$$;

REVOKE ALL ON FUNCTION private.can_current_user_access_chat_media_path(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.can_current_user_access_chat_media_path(TEXT, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media" ON storage.objects;

CREATE POLICY "Users can upload chat media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medias'
    AND private.can_current_user_access_chat_media_path(name, 'write')
  );

CREATE POLICY "Users can read chat media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medias'
    AND private.can_current_user_access_chat_media_path(name, 'read')
  );

CREATE POLICY "Users can delete own chat media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medias'
    AND private.can_current_user_access_chat_media_path(name, 'delete')
  );
