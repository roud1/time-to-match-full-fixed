/**
 * DB-backed connection analysis queue (see docs/AI_CONNECTION_WORKERS.md).
 * Enqueues on message thresholds; worker runs via cron or fire-and-forget after enqueue.
 */

import { processConnectionAnalysisJobs } from "@/lib/server/connection-ai-processor"
import { isOpenRouterConfigured } from "@/lib/server/openrouter"
import { enqueueAiAnalysisJob } from "@/lib/server/repositories/ai-analysis"
import { getServerEnv } from "@/lib/server/env"
import { setConnectionAnalyzing } from "@/lib/server/realtime/ephemeral"

export const ANALYSIS_INTERVAL = 5

/** Queue analysis when message count hits a threshold. Non-blocking for HTTP handlers. */
export function maybeQueueConnectionAnalysis(
  userId: string,
  matchId: string,
  messageCount: number
): boolean {
  if (!getServerEnv().isDatabaseConfigured) return false
  if (!isOpenRouterConfigured()) return false
  if (messageCount < ANALYSIS_INTERVAL) return false
  if (messageCount % ANALYSIS_INTERVAL !== 0) return false

  void enqueueAndKickWorker(userId, matchId, messageCount)
  return true
}

async function enqueueAndKickWorker(
  userId: string,
  matchId: string,
  messageCount: number
): Promise<void> {
  const { queued } = await enqueueAiAnalysisJob({ matchId, userId, messageCount })
  if (!queued) return

  await setConnectionAnalyzing(matchId)

  if (process.env.NODE_ENV !== "production") {
    console.info("[ttm/ai-worker] connection analysis queued", {
      matchId,
      messageCount,
      provider: "openrouter",
    })
  }

  void processConnectionAnalysisJobs(1).catch((err) => {
    console.error(
      "[ttm/ai-worker] inline process failed:",
      err instanceof Error ? err.message : err
    )
  })
}

export function getConnectionAnalysisWorkerNotes() {
  return {
    interval: ANALYSIS_INTERVAL,
    queue: "postgres ai_analysis_jobs + connection_scores",
    production: "cron /api/v1/cron/ai-analysis + inline kick after enqueue",
    api: "GET /api/matches/:id/connection-score",
    env: "OPENROUTER_API_KEY + DATABASE_URL",
  } as const
}
