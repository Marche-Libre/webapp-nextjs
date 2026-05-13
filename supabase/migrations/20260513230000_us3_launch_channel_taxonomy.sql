-- US3 launch chat channel taxonomy (canonical)
-- Canonical slugs: general, business, politique, divers, jobs
-- Legacy slugs to retire: recrutement, aide, random

-- 1) Ensure canonical launch channels exist with explicit permissions.
INSERT INTO public.channels (
  name,
  slug,
  description,
  is_private,
  read_permission,
  write_permission
)
VALUES
  ('Général', 'general', 'Discussions générales', FALSE, 'all', 'all'),
  ('Business', 'business', 'Discussions business et opportunités', FALSE, 'all', 'all'),
  ('Politique', 'politique', 'Discussions politiques', FALSE, 'all', 'all'),
  ('Divers', 'divers', 'Discussions variées', FALSE, 'all', 'all'),
  ('Jobs', 'jobs', 'Offres et opportunités professionnelles', FALSE, 'all', 'admin_only')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_private = FALSE,
  read_permission = 'all',
  write_permission = EXCLUDED.write_permission;

-- 2) Remap legacy channel messages to canonical channels.
WITH slug_map AS (
  SELECT
    old_channel.id AS old_channel_id,
    new_channel.id AS new_channel_id
  FROM (VALUES
    ('recrutement', 'jobs'),
    ('random', 'divers')
  ) AS mappings(old_slug, new_slug)
  JOIN public.channels AS old_channel ON old_channel.slug = mappings.old_slug
  JOIN public.channels AS new_channel ON new_channel.slug = mappings.new_slug
)
UPDATE public.messages AS messages
SET channel_id = slug_map.new_channel_id
FROM slug_map
WHERE messages.channel_id = slug_map.old_channel_id;

-- 3) Remap legacy channel memberships without creating duplicate PK pairs.
WITH slug_map AS (
  SELECT
    old_channel.id AS old_channel_id,
    new_channel.id AS new_channel_id
  FROM (VALUES
    ('recrutement', 'jobs'),
    ('random', 'divers')
  ) AS mappings(old_slug, new_slug)
  JOIN public.channels AS old_channel ON old_channel.slug = mappings.old_slug
  JOIN public.channels AS new_channel ON new_channel.slug = mappings.new_slug
)
INSERT INTO public.channel_members (channel_id, user_id, joined_at)
SELECT
  slug_map.new_channel_id,
  members.user_id,
  members.joined_at
FROM public.channel_members AS members
JOIN slug_map ON slug_map.old_channel_id = members.channel_id
ON CONFLICT (channel_id, user_id) DO NOTHING;

WITH slug_map AS (
  SELECT
    old_channel.id AS old_channel_id
  FROM (VALUES
    ('recrutement'),
    ('random')
  ) AS mappings(old_slug)
  JOIN public.channels AS old_channel ON old_channel.slug = mappings.old_slug
)
DELETE FROM public.channel_members AS members
USING slug_map
WHERE members.channel_id = slug_map.old_channel_id;

-- 4) Remove legacy channels.
-- `aide` is intentionally deleted without message remap.
DELETE FROM public.channels
WHERE slug IN ('recrutement', 'aide', 'random');
