-- Time to Match — core production schema (PostgreSQL 14+)
-- Run: npm run db:migrate

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL GENERATED ALWAYS AS (lower(trim(email))) STORED,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  profile_expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_key ON users (email_normalized);

CREATE INDEX IF NOT EXISTS users_profile_expires_idx ON users (profile_expires_at)
  WHERE profile_expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS conv_part_user_idx ON conversation_participants (user_id, joined_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT messages_body_len CHECK (char_length(body) BETWEEN 1 AND 8000)
);

CREATE INDEX IF NOT EXISTS messages_conv_created_idx ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS messages_expires_idx ON messages (expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS likes (
  from_user UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (from_user, to_user),
  CONSTRAINT likes_no_self CHECK (from_user <> to_user)
);

CREATE INDEX IF NOT EXISTS likes_to_user_idx ON likes (to_user, created_at DESC);

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'offline',
  CONSTRAINT user_presence_status_chk CHECK (status IN ('offline', 'online', 'away'))
);

COMMIT;
