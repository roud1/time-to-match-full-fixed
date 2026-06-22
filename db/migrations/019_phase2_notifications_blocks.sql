-- Phase 2: new_match notifications + peer-to-peer user blocks
BEGIN;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_chk;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_lead_hours_chk;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_chk
    CHECK (type IN ('profile_expiring', 'match_expiring', 'new_match')),
  ADD CONSTRAINT notifications_lead_hours_chk
    CHECK (lead_hours IN (0, 1, 6, 12));

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT user_blocks_no_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS user_blocks_blocked_idx ON user_blocks (blocked_id);

COMMIT;
