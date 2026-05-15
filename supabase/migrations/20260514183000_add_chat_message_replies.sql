CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID NULL;

DO $$
BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT messages_reply_to_message_id_fkey
    FOREIGN KEY (reply_to_message_id)
    REFERENCES public.messages(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  ALTER TABLE public.messages
    ADD CONSTRAINT messages_reply_to_not_self_check
    CHECK (reply_to_message_id IS NULL OR reply_to_message_id <> id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to_message_id
  ON public.messages (reply_to_message_id)
  WHERE reply_to_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_channel_reply_to
  ON public.messages (channel_id, reply_to_message_id)
  WHERE reply_to_message_id IS NOT NULL;

CREATE OR REPLACE FUNCTION private.enforce_message_reply_channel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private, pg_temp
AS $$
BEGIN
  IF NEW.reply_to_message_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.messages replied_message
    WHERE replied_message.id = NEW.reply_to_message_id
      AND replied_message.channel_id = NEW.channel_id
  ) THEN
    RAISE EXCEPTION 'message_reply_cross_channel'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_message_reply_channel ON public.messages;

CREATE TRIGGER enforce_message_reply_channel
  BEFORE INSERT OR UPDATE OF channel_id, reply_to_message_id ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION private.enforce_message_reply_channel();

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

  IF NEW.reply_to_message_id IS DISTINCT FROM OLD.reply_to_message_id THEN
    RAISE EXCEPTION 'message_reply_target_immutable'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned THEN
    RAISE EXCEPTION 'message_pin_admin_only'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
