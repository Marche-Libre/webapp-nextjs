-- Allow chat images in private storage without exposing public URLs.

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'medias',
  'medias',
  FALSE,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  5242880
)
ON CONFLICT (id) DO UPDATE
SET
  name = 'medias',
  public = FALSE,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  file_size_limit = 5242880;

DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can read chat media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat media" ON storage.objects;

CREATE POLICY "Users can upload chat media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medias'
    AND split_part(name, '/', 1) = 'chat'
    AND split_part(name, '/', 2) <> ''
    AND split_part(name, '/', 3) = (SELECT auth.uid())::text
    AND split_part(name, '/', 4) <> ''
    AND EXISTS (
      SELECT 1
      FROM public.channels c
      WHERE c.id::text = split_part(name, '/', 2)
        AND (
          c.is_private = FALSE
          OR (SELECT public.is_admin())
          OR EXISTS (
            SELECT 1
            FROM public.channel_members cm
            WHERE cm.channel_id = c.id
              AND cm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can read chat media"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medias'
    AND split_part(name, '/', 1) = 'chat'
    AND split_part(name, '/', 2) <> ''
    AND split_part(name, '/', 3) <> ''
    AND EXISTS (
      SELECT 1
      FROM public.channels c
      WHERE c.id::text = split_part(name, '/', 2)
        AND (
          c.is_private = FALSE
          OR (SELECT public.is_admin())
          OR EXISTS (
            SELECT 1
            FROM public.channel_members cm
            WHERE cm.channel_id = c.id
              AND cm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can delete own chat media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medias'
    AND split_part(name, '/', 1) = 'chat'
    AND split_part(name, '/', 2) <> ''
    AND split_part(name, '/', 3) <> ''
    AND (
      (SELECT public.is_admin())
      OR split_part(name, '/', 3) = (SELECT auth.uid())::text
    )
    AND EXISTS (
      SELECT 1
      FROM public.channels c
      WHERE c.id::text = split_part(name, '/', 2)
        AND (
          c.is_private = FALSE
          OR (SELECT public.is_admin())
          OR EXISTS (
            SELECT 1
            FROM public.channel_members cm
            WHERE cm.channel_id = c.id
              AND cm.user_id = (SELECT auth.uid())
          )
        )
    )
  );

DROP POLICY IF EXISTS "Approved users can send messages to allowed channels" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

CREATE POLICY "Approved users can send messages to allowed channels"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (
      image_url IS NULL
      OR (
        split_part(image_url, '/', 1) = 'chat'
        AND split_part(image_url, '/', 2) = messages.channel_id::text
        AND split_part(image_url, '/', 3) = (SELECT auth.uid())::text
      )
    )
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
      AND (
        image_url IS NULL
        OR (
          split_part(image_url, '/', 1) = 'chat'
          AND split_part(image_url, '/', 2) = messages.channel_id::text
          AND split_part(image_url, '/', 3) = (SELECT auth.uid())::text
        )
      )
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
