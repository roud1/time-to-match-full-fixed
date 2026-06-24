-- Monetization: daily like limits, profile boost, premium_until grace
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS users_boost_expires_idx ON users (boost_expires_at)
  WHERE boost_expires_at IS NOT NULL;

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS user_daily_likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  like_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  likes_used INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, like_date),
  CONSTRAINT user_daily_likes_nonnegative CHECK (likes_used >= 0)
);

CREATE INDEX IF NOT EXISTS user_daily_likes_date_idx ON user_daily_likes (like_date);

COMMIT;
