import type { AIConnectionAnalysis } from "@/lib/ai-connection-engine/types"
import { getDb } from "@/lib/server/db"

export type DbAiAnalysisJobRow = {
  id: string
  match_id: string
  triggered_by: string
  message_count: number
  status: "pending" | "processing" | "completed" | "failed"
  payload: Record<string, unknown> | null
  result: Record<string, unknown> | null
  error: string | null
  created_at: Date
  started_at: Date | null
  completed_at: Date | null
}

export type DbConnectionScoreRow = {
  id: string
  match_id: string
  job_id: string | null
  message_count: number
  sync: number
  chemistry: string
  bond: string
  energy: string
  emotional_state: string
  connection_state: string
  personality: string
  insight: string
  atmosphere_level: number
  memories: unknown
  source: string
  analyzed_at: Date
  created_at: Date
}

export async function enqueueAiAnalysisJob(input: {
  matchId: string
  userId: string
  messageCount: number
}): Promise<{ queued: boolean; jobId?: string }> {
  const db = getDb()
  if (!db) return { queued: false }

  const rows = await db<{ id: string }[]>`
    INSERT INTO ai_analysis_jobs (match_id, triggered_by, message_count, payload)
    VALUES (
      ${input.matchId},
      ${input.userId},
      ${input.messageCount},
      ${db.json({ messageCount: input.messageCount })}
    )
    ON CONFLICT (match_id, message_count) WHERE (status IN ('pending', 'processing'))
    DO NOTHING
    RETURNING id
  `

  const job = rows[0]
  if (!job) return { queued: false }
  return { queued: true, jobId: job.id }
}

export async function claimPendingAiAnalysisJobs(limit = 5): Promise<DbAiAnalysisJobRow[]> {
  const db = getDb()
  if (!db) return []

  return db<DbAiAnalysisJobRow[]>`
    UPDATE ai_analysis_jobs
    SET status = 'processing', started_at = now()
    WHERE id IN (
      SELECT id
      FROM ai_analysis_jobs
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING
      id, match_id, triggered_by, message_count, status,
      payload, result, error, created_at, started_at, completed_at
  `
}

export async function completeAiAnalysisJob(
  jobId: string,
  result: AIConnectionAnalysis
): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE ai_analysis_jobs
    SET
      status = 'completed',
      result = ${db.json(JSON.parse(JSON.stringify(result)))},
      completed_at = now()
    WHERE id = ${jobId}
  `
}

export async function failAiAnalysisJob(jobId: string, error: string): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE ai_analysis_jobs
    SET
      status = 'failed',
      error = ${error.slice(0, 500)},
      completed_at = now()
    WHERE id = ${jobId}
  `
}

export async function saveConnectionScore(input: {
  matchId: string
  jobId: string
  messageCount: number
  analysis: AIConnectionAnalysis
}): Promise<void> {
  const db = getDb()
  if (!db) return

  const { analysis } = input
  await db`
    INSERT INTO connection_scores (
      match_id,
      job_id,
      message_count,
      sync,
      chemistry,
      bond,
      energy,
      emotional_state,
      connection_state,
      personality,
      insight,
      atmosphere_level,
      memories,
      source,
      analyzed_at
    )
    VALUES (
      ${input.matchId},
      ${input.jobId},
      ${input.messageCount},
      ${analysis.sync},
      ${analysis.chemistry},
      ${analysis.bond},
      ${analysis.energy},
      ${analysis.emotionalState},
      ${analysis.connectionState},
      ${analysis.personality},
      ${analysis.insight},
      ${analysis.atmosphereLevel},
      ${db.json(analysis.memories)},
      ${analysis.source},
      to_timestamp(${analysis.analyzedAt / 1000})
    )
  `
}

export function rowToConnectionAnalysis(row: DbConnectionScoreRow): AIConnectionAnalysis {
  const memories = Array.isArray(row.memories)
    ? (row.memories as AIConnectionAnalysis["memories"])
    : []

  return {
    sync: row.sync,
    chemistry: row.chemistry as AIConnectionAnalysis["chemistry"],
    bond: row.bond as AIConnectionAnalysis["bond"],
    energy: row.energy as AIConnectionAnalysis["energy"],
    emotionalState: row.emotional_state as AIConnectionAnalysis["emotionalState"],
    connectionState: row.connection_state as AIConnectionAnalysis["connectionState"],
    personality: row.personality as AIConnectionAnalysis["personality"],
    insight: row.insight,
    atmosphereLevel: row.atmosphere_level,
    memories,
    source: row.source as AIConnectionAnalysis["source"],
    analyzedAt: row.analyzed_at.getTime(),
  }
}

export async function getLatestConnectionScore(
  matchId: string
): Promise<(AIConnectionAnalysis & { messageCount: number; id: string }) | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<DbConnectionScoreRow[]>`
    SELECT
      id, match_id, job_id, message_count, sync, chemistry, bond, energy,
      emotional_state, connection_state, personality, insight, atmosphere_level,
      memories, source, analyzed_at, created_at
    FROM connection_scores
    WHERE match_id = ${matchId}
    ORDER BY analyzed_at DESC
    LIMIT 1
  `

  const row = rows[0]
  if (!row) return null

  return {
    id: row.id,
    messageCount: row.message_count,
    ...rowToConnectionAnalysis(row),
  }
}

export async function hasPendingAiAnalysisJob(matchId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM ai_analysis_jobs
      WHERE match_id = ${matchId}
        AND status IN ('pending', 'processing')
    ) AS exists
  `
  return Boolean(rows[0]?.exists)
}
