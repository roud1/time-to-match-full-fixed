-- Matching service: activity tracking for compatibility scoring
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS users_last_active_at_idx
  ON users (last_active_at DESC)
  WHERE is_active = true;

COMMIT;
