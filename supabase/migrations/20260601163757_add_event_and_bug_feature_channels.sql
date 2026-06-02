-- Add launch chat channels for events and product feedback.
-- Existing channel rows are aligned idempotently without touching messages.
INSERT INTO public.channels (
  name,
  slug,
  description,
  is_private,
  read_permission,
  write_permission
)
VALUES
  (
    'Événements',
    'evenements',
    'Annonces et événements de la communauté',
    FALSE,
    'all',
    'admin_only'
  ),
  (
    'Bug / Feature',
    'bug-feature',
    'Bugs, retours et demandes de fonctionnalités',
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
