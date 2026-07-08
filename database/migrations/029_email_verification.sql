-- Email verification tokens
-- Reuses password_reset_tokens structure with purpose column
BEGIN;

ALTER TABLE password_reset_tokens
  ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'password_reset'
    CHECK (purpose IN ('password_reset', 'email_verify'));

-- Index for email verification lookups
CREATE INDEX IF NOT EXISTS password_reset_tokens_purpose_idx
  ON password_reset_tokens (token_hash, purpose)
  WHERE used_at IS NULL;

COMMIT;
