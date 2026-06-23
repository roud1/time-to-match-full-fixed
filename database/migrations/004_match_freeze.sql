-- Match expiry + freeze (likes) and per-user freeze cooldown
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_freeze_at TIMESTAMPTZ;

ALTER TABLE likes
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_match BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_expired BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN NOT NULL DEFAULT false;

UPDATE likes SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE likes ALTER COLUMN id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS likes_id_key ON likes (id);

CREATE INDEX IF NOT EXISTS likes_match_expires_idx ON likes (from_user, expires_at)
  WHERE is_match = true AND is_expired = false;

COMMIT;
