-- Photo verification (gesture selfie)
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS photo_verified BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  gesture TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS verification_requests_user_created_idx
  ON verification_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS verification_requests_pending_idx
  ON verification_requests (status)
  WHERE status = 'pending';

COMMIT;
