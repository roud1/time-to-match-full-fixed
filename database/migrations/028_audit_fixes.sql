-- Audit fixes: super-like tracking
BEGIN;

ALTER TABLE likes
  ADD COLUMN IF NOT EXISTS is_super BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS user_daily_super_likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  like_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  super_likes_used INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, like_date),
  CONSTRAINT user_daily_super_likes_nonnegative CHECK (super_likes_used >= 0)
);

CREATE INDEX IF NOT EXISTS user_daily_super_likes_date_idx ON user_daily_super_likes (like_date);

COMMIT;
