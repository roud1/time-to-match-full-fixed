-- Behavior, ranking, and advanced expiration engines
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS behavior_score REAL NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS response_time_avg_ms INT,
  ADD COLUMN IF NOT EXISTS ignore_rate REAL NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_score REAL NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS conversation_depth REAL NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ranking_tier TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS discover_visibility REAL NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_behavior_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS matches_expired_as_ghost INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS matches_total INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS messages_sent_7d INT NOT NULL DEFAULT 0;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_ranking_tier_chk;

ALTER TABLE users
  ADD CONSTRAINT users_ranking_tier_chk CHECK (ranking_tier IN ('hot', 'normal', 'low'));

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_discover_visibility_chk;

ALTER TABLE users
  ADD CONSTRAINT users_discover_visibility_chk CHECK (
    discover_visibility >= 0.1 AND discover_visibility <= 1.5
  );

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS priority_level SMALLINT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS urgency_level TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS non_responder_id UUID REFERENCES users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS first_message_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS urgency_updated_at TIMESTAMPTZ;

ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_urgency_level_chk;

ALTER TABLE matches
  ADD CONSTRAINT matches_urgency_level_chk CHECK (
    urgency_level IN ('normal', 'low_visibility', 'warning', 'critical', 'expired')
  );

ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_priority_level_chk;

ALTER TABLE matches
  ADD CONSTRAINT matches_priority_level_chk CHECK (
    priority_level BETWEEN 1 AND 5
  );

CREATE TABLE IF NOT EXISTS user_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  match_id UUID REFERENCES matches (id) ON DELETE SET NULL,
  value_num REAL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_behavior_events_type_chk CHECK (
    event_type IN (
      'message_sent',
      'message_reply',
      'match_created',
      'match_expired',
      'match_ghost',
      'score_recomputed'
    )
  )
);

CREATE INDEX IF NOT EXISTS user_behavior_events_user_idx
  ON user_behavior_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS matches_urgency_active_idx
  ON matches (urgency_level, created_at)
  WHERE status <> 'expired';

-- Allow urgency-specific notifications (12h warning to ghost)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_chk;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_chk CHECK (
    type IN (
      'profile_expiring',
      'match_expiring',
      'match_urgency_warning',
      'achievement_unlocked'
    )
  );

COMMIT;
