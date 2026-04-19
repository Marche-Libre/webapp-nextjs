-- Profile enhancements: split name, availability, skills, rate, website, visibility

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS daily_rate text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS visibility jsonb DEFAULT '{
    "first_name":true,"last_name":true,"phone":false,"email":false,
    "location":true,"specialty":true,"bio":true,"years_experience":true,
    "links":true,"daily_rate":false,"website":true,"skills":true
  }'::jsonb;

-- Migrate full_name -> first_name / last_name
UPDATE profiles SET
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE
    WHEN position(' ' in full_name) > 0
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL
  END
WHERE full_name IS NOT NULL AND full_name != ''
  AND first_name IS NULL;
