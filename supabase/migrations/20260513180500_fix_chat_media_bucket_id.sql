-- Repair chat media bucket records created with name = 'medias' but a random id.
-- Supabase clients address buckets by id: storage.from('medias') needs id = 'medias'.

DO $$
DECLARE
  legacy_bucket_id TEXT;
BEGIN
  SELECT id
  INTO legacy_bucket_id
  FROM storage.buckets
  WHERE name = 'medias'
    AND id <> 'medias'
  LIMIT 1;

  IF legacy_bucket_id IS NOT NULL THEN
    UPDATE storage.buckets
    SET name = 'medias_legacy_' || replace(legacy_bucket_id, '-', '_')
    WHERE id = legacy_bucket_id;
  END IF;

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

  IF legacy_bucket_id IS NOT NULL THEN
    UPDATE storage.objects
    SET bucket_id = 'medias'
    WHERE bucket_id = legacy_bucket_id;
  END IF;
END $$;
