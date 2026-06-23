-- Refresh tokens for JWT session rotation (hashed at rest)
BEGIN;

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_refresh_tokens_user_idx ON user_refresh_tokens (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS user_refresh_tokens_hash_idx ON user_refresh_tokens (token_hash)
  WHERE revoked_at IS NULL;

COMMIT;
