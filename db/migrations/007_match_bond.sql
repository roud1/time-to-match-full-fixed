-- Bond growth via messaging (match_stats per likes row)
BEGIN;

CREATE TABLE IF NOT EXISTS match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL UNIQUE REFERENCES likes (id) ON DELETE CASCADE,
  total_messages INTEGER NOT NULL DEFAULT 0,
  last_prolonged_at TIMESTAMPTZ,
  prolong_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS match_stats_match_id_idx ON match_stats (match_id);

COMMIT;
