-- Shared connection / Pulse system (PostgreSQL 14+)
-- Run: npm run db:migrate

BEGIN;

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  stage TEXT NOT NULL DEFAULT 'spark',
  status TEXT NOT NULL DEFAULT 'alive',
  streak_days INT NOT NULL DEFAULT 0,
  streak_score INT NOT NULL DEFAULT 0,
  my_messages INT NOT NULL DEFAULT 0,
  their_messages INT NOT NULL DEFAULT 0,
  both_participated BOOLEAN NOT NULL DEFAULT false,
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stabilized_at TIMESTAMPTZ,
  fade_started_at TIMESTAMPTZ,
  total_extensions_ms BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT connections_no_self CHECK (user_a <> user_b),
  CONSTRAINT connections_status_chk CHECK (status IN ('alive', 'fading', 'archived')),
  CONSTRAINT connections_stage_chk CHECK (
    stage IN ('spark', 'active', 'strong', 'rare', 'stable')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS connections_pair_key ON connections (
  LEAST(user_a, user_b),
  GREATEST(user_a, user_b)
);

CREATE INDEX IF NOT EXISTS connections_user_a_expires_idx ON connections (user_a, expires_at)
  WHERE status <> 'archived';
CREATE INDEX IF NOT EXISTS connections_user_b_expires_idx ON connections (user_b, expires_at)
  WHERE status <> 'archived';

CREATE TABLE IF NOT EXISTS connection_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES connections (id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  peer_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  days_together INT NOT NULL DEFAULT 1,
  stage_reached TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'expired',
  CONSTRAINT connection_memories_reason_chk CHECK (reason IN ('expired', 'faded'))
);

CREATE INDEX IF NOT EXISTS connection_memories_user_idx ON connection_memories (user_id, ended_at DESC);

COMMIT;
