-- Reports & moderation system
-- Run: npm run db:migrate

BEGIN;

-- Extend users with moderation fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CONSTRAINT users_role_chk CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS block_reason TEXT;

CREATE INDEX IF NOT EXISTS users_blocked_idx ON users (is_blocked) WHERE is_blocked = true;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users (id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages (id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reports_status_chk CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS reports_reporter_idx ON reports (reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reported_idx ON reports (reported_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status, created_at DESC);

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_reports_updated_at_trg'
  ) THEN
    CREATE TRIGGER set_reports_updated_at_trg
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_reports_updated_at();
  END IF;
END;
$$;

COMMIT;

