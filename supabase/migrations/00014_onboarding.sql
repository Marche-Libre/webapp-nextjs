ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS looking_for TEXT;

ALTER TABLE forum_categories
  ADD COLUMN IF NOT EXISTS is_introduction BOOLEAN DEFAULT false;

INSERT INTO forum_categories (name, slug, description, color, icon, "order")
VALUES (
  'Présentations',
  'presentations',
  'Présentez-vous à la communauté',
  '#8B5CF6',
  'hand-wave',
  0
)
ON CONFLICT (slug) DO NOTHING;

UPDATE forum_categories
SET is_introduction = true
WHERE slug = 'presentations';
