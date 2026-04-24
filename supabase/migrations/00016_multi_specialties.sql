-- Multi-specialties: allow up to 3 sub-specialties per profile
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty_ids uuid[] DEFAULT '{}';

-- Migrate existing specialty_id → specialty_ids
UPDATE profiles
  SET specialty_ids = ARRAY[specialty_id]
  WHERE specialty_id IS NOT NULL AND specialty_ids = '{}';

-- Drop obsolete columns
ALTER TABLE profiles DROP COLUMN IF EXISTS specialty_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS specialty;
