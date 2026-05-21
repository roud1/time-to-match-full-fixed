-- Client connection/social snapshot sync (demo profile IDs in JSON)
-- Run: npm run db:migrate

BEGIN;

CREATE TABLE IF NOT EXISTS user_app_state (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  connections_json JSONB NOT NULL DEFAULT '{"version":1,"connections":[],"memories":[],"recentEvents":[]}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_app_state_updated_idx ON user_app_state (updated_at DESC);

COMMIT;
