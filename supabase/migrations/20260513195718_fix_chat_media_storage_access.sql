-- Align private chat media storage authorization with message/channel access.
-- Existing production rows can predate read_permission/write_permission, so treat
-- NULL channel permissions as the historical default: 'all'.

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

  current_user_is_admin := COALESCE((SELECT public.is_admin()), FALSE);

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
    FROM public.profiles p
    WHERE p.id = current_user_id
      AND p.status = 'approved'
      AND (
        access_mode <> 'write'
        OR (
          COALESCE(p.chat_banned, FALSE) = FALSE
          AND (p.chat_muted_until IS NULL OR p.chat_muted_until <= NOW())
        )
      )
  )
  AND EXISTS (
    SELECT 1
    FROM public.channels c
    WHERE c.id = channel_id_value
      AND (
        current_user_is_admin
        OR (
          CASE
            WHEN access_mode = 'write' THEN COALESCE(c.write_permission, 'all') = 'all'
            ELSE COALESCE(c.read_permission, 'all') = 'all'
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
