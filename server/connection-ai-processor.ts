import type { AIConnectionAnalysis } from "@/client/lib/ai-connection-engine/types"
import { analyzeConnectionOnServer } from "@/server/connection-ai-service"
import { buildAnalyzeRequestFromServerMessages } from "@/server/connection-ai-request"
import { log } from "@/server/log"
import { getMatchDetailForUser } from "@/server/match-engine/repository"
import {
  claimPendingAiAnalysisJobs,
  completeAiAnalysisJob,
  failAiAnalysisJob,
  saveConnectionScore,
  type DbAiAnalysisJobRow,
} from "@/server/repositories/ai-analysis"
import { findMatchByIdForUser } from "@/server/repositories/likes"
import { clearConnectionAnalyzing } from "@/server/realtime/ephemeral"

const DEFAULT_LOCALE = "ru"

async function processJob(job: DbAiAnalysisJobRow): Promise<void> {
  const like = await findMatchByIdForUser(job.match_id, job.triggered_by)
  if (!like?.match_id) {
    await failAiAnalysisJob(job.id, "match_not_found")
    await clearConnectionAnalyzing(job.match_id)
    return
  }

  const detail = await getMatchDetailForUser(job.match_id, job.triggered_by, 40)
  if (!detail || detail.messages.length === 0) {
    await failAiAnalysisJob(job.id, "no_messages")
    await clearConnectionAnalyzing(job.match_id)
    return
  }

  const body = buildAnalyzeRequestFromServerMessages({
    peerUserId: like.to_user,
    locale: DEFAULT_LOCALE,
    messages: detail.messages,
    matchedAt: like.created_at,
    expiresAt: like.expires_at,
  })

  if (!body) {
    await failAiAnalysisJob(job.id, "empty_transcript")
    await clearConnectionAnalyzing(job.match_id)
    return
  }

  const result = await analyzeConnectionOnServer(body)
  if (!result.ok) {
    await failAiAnalysisJob(job.id, result.error)
    await clearConnectionAnalyzing(job.match_id)
    return
  }

  await persistAnalysis(job, result.data)
}

async function persistAnalysis(job: DbAiAnalysisJobRow, analysis: AIConnectionAnalysis): Promise<void> {
  await saveConnectionScore({
    matchId: job.match_id,
    jobId: job.id,
    messageCount: job.message_count,
    analysis,
  })
  await completeAiAnalysisJob(job.id, analysis)
  await clearConnectionAnalyzing(job.match_id)

  if (process.env.NODE_ENV !== "production") {
    log.info("ai_analysis_job_done", {
      matchId: job.match_id,
      messageCount: job.message_count,
      source: analysis.source,
      sync: analysis.sync,
    })
  }
}

export async function processConnectionAnalysisJobs(limit = 5): Promise<{
  claimed: number
  completed: number
  failed: number
}> {
  const jobs = await claimPendingAiAnalysisJobs(limit)
  let completed = 0
  let failed = 0

  for (const job of jobs) {
    try {
      await processJob(job)
      completed += 1
    } catch (e) {
      failed += 1
      const message = e instanceof Error ? e.message : "unknown_error"
      log.error("ai_analysis_job_err", { jobId: job.id, matchId: job.match_id, err: message })
      await failAiAnalysisJob(job.id, message)
      await clearConnectionAnalyzing(job.match_id)
    }
  }

  return { claimed: jobs.length, completed, failed }
}
