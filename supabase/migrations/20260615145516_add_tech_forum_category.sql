-- Add a dedicated forum category for technology discussions.
UPDATE public.forum_categories
SET "order" = 8
WHERE slug = 'hors-sujet'
  AND "order" = 7;

INSERT INTO public.forum_categories (name, slug, description, color, icon, "order")
VALUES (
  'Tech',
  'tech',
  'Discussions techniques, outils et sujets liés à la tech',
  '#2563eb',
  'code',
  7
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  "order" = EXCLUDED."order";
