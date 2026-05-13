ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_messages_channel_pinned_created
  ON public.messages (channel_id, created_at DESC)
  WHERE is_pinned = TRUE;

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

  IF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned THEN
    RAISE EXCEPTION 'message_pin_admin_only'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
