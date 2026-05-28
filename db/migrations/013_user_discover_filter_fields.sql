-- Add explicit discover filter fields on users
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age_min INT,
  ADD COLUMN IF NOT EXISTS age_max INT;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_gender_chk;

ALTER TABLE users
  ADD CONSTRAINT users_gender_chk CHECK (gender IN ('male', 'female') OR gender IS NULL);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_age_bounds_chk;

ALTER TABLE users
  ADD CONSTRAINT users_age_bounds_chk CHECK (
    (age_min IS NULL OR age_min BETWEEN 18 AND 99)
    AND (age_max IS NULL OR age_max BETWEEN 18 AND 99)
    AND (age_min IS NULL OR age_max IS NULL OR age_min <= age_max)
  );

CREATE INDEX IF NOT EXISTS users_gender_idx ON users (gender) WHERE gender IS NOT NULL;

COMMIT;

