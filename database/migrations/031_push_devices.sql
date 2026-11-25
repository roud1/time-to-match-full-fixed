-- Instant notifications: native app push tokens (Android, Firebase Cloud Messaging) and a small
-- throttle table so chat messages do not send a push for every single message.
-- Additive only. Rows are removed with the account (ON DELETE CASCADE).

CREATE TABLE IF NOT EXISTS push_devices (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'android',
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_devices_platform_chk CHECK (platform IN ('android', 'ios')),
  CONSTRAINT push_devices_token_len CHECK (char_length(token) BETWEEN 20 AND 4096)
);

CREATE INDEX IF NOT EXISTS push_devices_user_idx ON push_devices (user_id);

CREATE TABLE IF NOT EXISTS push_throttle (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
