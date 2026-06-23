/**
 * Lightweight async connection analysis on message thresholds.
 * Full production: replace with BullMQ / Redis queue workers (see docs/AI_CONNECTION_WORKERS.md).
 */

import { isOpenRouterConfigured } from "@/lib/server/openrouter"
import { setConnectionAnalyzing } from "@/lib/server/realtime/ephemeral"

const ANALYSIS_INTERVAL = 5

type PendingJob = {
  userId: string
  matchId: string
  messageCount: number
  queuedAt: number
}

const pending = new Map<string, PendingJob>()

function jobKey(userId: string, matchId: string) {
  return `${userId}:${matchId}`
}

/** Queue (in-process) analysis when message count hits a threshold. */
export function maybeQueueConnectionAnalysis(
  userId: string,
  matchId: string,
  messageCount: number
): boolean {
  if (!isOpenRouterConfigured()) return false
  if (messageCount < ANALYSIS_INTERVAL) return false
  if (messageCount % ANALYSIS_INTERVAL !== 0) return false

  const key = jobKey(userId, matchId)
  pending.set(key, { userId, matchId, messageCount, queuedAt: Date.now() })

  void setConnectionAnalyzing(matchId)

  queueMicrotask(() => {
    void flushConnectionAnalysisJob(key)
  })

  return true
}

async function flushConnectionAnalysisJob(key: string): Promise<void> {
  const job = pending.get(key)
  if (!job) return
  pending.delete(key)

  // Client triggers POST /api/analyze-connection; server marks analyzing for UI polling.
  if (process.env.NODE_ENV !== "production") {
    console.info("[ttm/ai-worker] connection analysis queued", {
      matchId: job.matchId,
      messageCount: job.messageCount,
      provider: "openrouter",
    })
  }
}

export function getConnectionAnalysisWorkerNotes() {
  return {
    interval: ANALYSIS_INTERVAL,
    queue: "in-process stub + ephemeral analyzing flag",
    production: "BullMQ + Redis or Vercel background functions",
    api: "POST /api/analyze-connection",
    env: "OPENROUTER_API_KEY",
  } as const
}
