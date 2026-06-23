-- AI connection analysis: job queue + persisted scores
BEGIN;

CREATE TABLE IF NOT EXISTS ai_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES likes (id) ON DELETE CASCADE,
  triggered_by UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT ai_analysis_jobs_status_chk CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS ai_analysis_jobs_pending_idx
  ON ai_analysis_jobs (created_at)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS ai_analysis_jobs_match_count_active_idx
  ON ai_analysis_jobs (match_id, message_count)
  WHERE status IN ('pending', 'processing');

CREATE TABLE IF NOT EXISTS connection_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES likes (id) ON DELETE CASCADE,
  job_id UUID REFERENCES ai_analysis_jobs (id) ON DELETE SET NULL,
  message_count INTEGER NOT NULL,
  sync INTEGER NOT NULL,
  chemistry TEXT NOT NULL,
  bond TEXT NOT NULL,
  energy TEXT NOT NULL,
  emotional_state TEXT NOT NULL,
  connection_state TEXT NOT NULL,
  personality TEXT NOT NULL,
  insight TEXT NOT NULL,
  atmosphere_level INTEGER NOT NULL,
  memories JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'local',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connection_scores_match_analyzed_idx
  ON connection_scores (match_id, analyzed_at DESC);

COMMIT;
