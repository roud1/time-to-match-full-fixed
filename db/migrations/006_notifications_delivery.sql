-- Expiry notifications queue + push/email delivery fields
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS push_subscription JSONB,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Registration email exists; mark existing accounts verified for delivery
UPDATE users SET email_verified = true WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  reference_id UUID REFERENCES users (id) ON DELETE CASCADE,
  lead_hours INT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_type_chk CHECK (type IN ('profile_expiring', 'match_expiring')),
  CONSTRAINT notifications_lead_hours_chk CHECK (lead_hours IN (1, 6, 12))
);

CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_key ON notifications (
  user_id,
  type,
  COALESCE(reference_id, '00000000-0000-0000-0000-000000000000'::uuid),
  lead_hours
);

CREATE INDEX IF NOT EXISTS notifications_pending_idx
  ON notifications (scheduled_for)
  WHERE sent = false;

CREATE INDEX IF NOT EXISTS notifications_inbox_idx
  ON notifications (user_id, created_at DESC)
  WHERE sent = true AND read = false;

COMMIT;
