-- User profile: dedicated columns + user_photos table
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT,
  ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS user_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_photos_url_len CHECK (char_length(url) BETWEEN 1 AND 4096),
  CONSTRAINT user_photos_position_chk CHECK (position >= 0 AND position < 20)
);

CREATE INDEX IF NOT EXISTS user_photos_user_position_idx
  ON user_photos (user_id, position ASC);

CREATE UNIQUE INDEX IF NOT EXISTS user_photos_one_primary_idx
  ON user_photos (user_id)
  WHERE is_primary = true;

-- Backfill bio from legacy profile JSONB
UPDATE users
SET bio = NULLIF(trim(profile->>'bio'), '')
WHERE bio IS NULL
  AND profile ? 'bio'
  AND NULLIF(trim(profile->>'bio'), '') IS NOT NULL;

-- Backfill birth_date from legacy profile.birthdate (YYYY-MM-DD)
UPDATE users
SET birth_date = (profile->>'birthdate')::date
WHERE birth_date IS NULL
  AND profile ? 'birthdate'
  AND (profile->>'birthdate') ~ '^\d{4}-\d{2}-\d{2}$';

-- Backfill location city from legacy profile fields
UPDATE users
SET location_city = COALESCE(
  NULLIF(trim(profile->>'customCity'), ''),
  NULLIF(trim(profile->>'cityId'), '')
)
WHERE location_city IS NULL
  AND (
    (profile ? 'customCity' AND NULLIF(trim(profile->>'customCity'), '') IS NOT NULL)
    OR (profile ? 'cityId' AND NULLIF(trim(profile->>'cityId'), '') IS NOT NULL)
  );

-- Backfill user_photos from legacy profile.photoUrls
DO $$
DECLARE
  r RECORD;
  url TEXT;
  idx INT;
BEGIN
  FOR r IN
    SELECT id, profile
    FROM users
    WHERE profile ? 'photoUrls'
      AND jsonb_typeof(profile->'photoUrls') = 'array'
      AND jsonb_array_length(profile->'photoUrls') > 0
  LOOP
    IF EXISTS (SELECT 1 FROM user_photos WHERE user_id = r.id LIMIT 1) THEN
      CONTINUE;
    END IF;
    idx := 0;
    FOR url IN SELECT jsonb_array_elements_text(r.profile->'photoUrls') LOOP
      IF url IS NOT NULL AND trim(url) <> '' THEN
        INSERT INTO user_photos (user_id, url, position, is_primary)
        VALUES (r.id, trim(url), idx, idx = 0);
        idx := idx + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;

COMMIT;
