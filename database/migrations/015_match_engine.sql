-- Canonical match engine (24h TTL, status machine, messages)
BEGIN;

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'new_match',
  user1_has_sent BOOLEAN NOT NULL DEFAULT false,
  user2_has_sent BOOLEAN NOT NULL DEFAULT false,
  expired_at TIMESTAMPTZ,
  CONSTRAINT matches_no_self CHECK (user1_id <> user2_id),
  CONSTRAINT matches_users_ordered CHECK (user1_id < user2_id),
  CONSTRAINT matches_status_chk CHECK (
    status IN ('new_match', 'waiting_reply', 'active_chat', 'expired')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS matches_pair_key ON matches (user1_id, user2_id);

CREATE INDEX IF NOT EXISTS matches_expires_active_idx ON matches (expires_at)
  WHERE status <> 'expired';

CREATE TABLE IF NOT EXISTS match_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT match_messages_body_len CHECK (char_length(body) BETWEEN 1 AND 8000)
);

CREATE INDEX IF NOT EXISTS match_messages_match_created_idx
  ON match_messages (match_id, created_at DESC);

ALTER TABLE likes
  ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS likes_match_id_idx ON likes (match_id) WHERE match_id IS NOT NULL;

-- Backfill canonical matches from existing mutual likes (one row per unordered pair)
INSERT INTO matches (user1_id, user2_id, created_at, expires_at, status, expired_at)
SELECT
  LEAST(a.from_user, a.to_user) AS user1_id,
  GREATEST(a.from_user, a.to_user) AS user2_id,
  MIN(a.created_at) AS created_at,
  COALESCE(MAX(a.expires_at), MIN(a.created_at) + interval '24 hours') AS expires_at,
  CASE
    WHEN BOOL_OR(a.is_expired) OR COALESCE(MAX(a.expires_at), now()) <= now() THEN 'expired'
    WHEN COALESCE(ms.total_messages, 0) >= 2 THEN 'active_chat'
    WHEN COALESCE(ms.total_messages, 0) >= 1 THEN 'waiting_reply'
    ELSE 'new_match'
  END AS status,
  CASE
    WHEN BOOL_OR(a.is_expired) OR COALESCE(MAX(a.expires_at), now()) <= now() THEN MAX(a.expires_at)
    ELSE NULL
  END AS expired_at
FROM likes a
JOIN likes b
  ON a.from_user = b.to_user
 AND a.to_user = b.from_user
 AND a.is_match = true
 AND b.is_match = true
LEFT JOIN match_stats ms ON ms.match_id = a.id
WHERE a.from_user < a.to_user
GROUP BY LEAST(a.from_user, a.to_user), GREATEST(a.from_user, a.to_user)
ON CONFLICT (user1_id, user2_id) DO NOTHING;

UPDATE likes l
SET match_id = m.id
FROM matches m
WHERE l.is_match = true
  AND l.match_id IS NULL
  AND LEAST(l.from_user, l.to_user) = m.user1_id
  AND GREATEST(l.from_user, l.to_user) = m.user2_id;

COMMIT;
