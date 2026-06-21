-- Discover pass/skip tracking (exclude from feed)
BEGIN;

CREATE TABLE IF NOT EXISTS discover_passes (
  from_user UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (from_user, to_user),
  CONSTRAINT discover_passes_no_self CHECK (from_user <> to_user)
);

CREATE INDEX IF NOT EXISTS discover_passes_from_user_idx ON discover_passes (from_user, created_at DESC);

COMMIT;
