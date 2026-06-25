-- Server analytics events + someone_liked_you notification type
BEGIN;

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events (event, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_user_idx ON analytics_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_chk;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_lead_hours_chk;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_chk CHECK (
    type IN (
      'profile_expiring',
      'match_expiring',
      'match_urgency_warning',
      'achievement_unlocked',
      'new_match',
      'someone_liked_you'
    )
  ),
  ADD CONSTRAINT notifications_lead_hours_chk CHECK (lead_hours IN (0, 1, 6, 12));

COMMIT;
