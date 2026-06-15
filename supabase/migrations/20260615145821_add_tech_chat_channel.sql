-- Add a launch chat channel for technology discussions.
INSERT INTO public.channels (
  name,
  slug,
  description,
  is_private,
  read_permission,
  write_permission
)
VALUES (
  'Tech',
  'tech',
  'Discussions tech, outils et sujets techniques',
  FALSE,
  'all',
  'all'
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_private = FALSE,
  read_permission = EXCLUDED.read_permission,
  write_permission = EXCLUDED.write_permission;
