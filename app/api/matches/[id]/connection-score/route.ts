import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { isOpenRouterConfigured } from "@/lib/server/openrouter"
import {
  getLatestConnectionScore,
  hasPendingAiAnalysisJob,
} from "@/lib/server/repositories/ai-analysis"
import { findMatchByIdForUser } from "@/lib/server/repositories/likes"
import { isConnectionAnalyzing } from "@/lib/server/realtime/ephemeral"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/matches/:id/connection-score — latest persisted AI analysis */
export async function GET(request: Request, context: RouteContext) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const { id: matchId } = await context.params
  if (!matchId?.trim() || matchId.startsWith("local:")) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  const like = await findMatchByIdForUser(matchId.trim(), session.sub)
  if (!like) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const [score, analyzing, pending] = await Promise.all([
    getLatestConnectionScore(matchId.trim()),
    isConnectionAnalyzing(matchId.trim()),
    hasPendingAiAnalysisJob(matchId.trim()),
  ])

  return withCors(
    request,
    jsonOk({
      configured: isOpenRouterConfigured(),
      analyzing: analyzing || pending,
      score: score
        ? {
            id: score.id,
            messageCount: score.messageCount,
            sync: score.sync,
            chemistry: score.chemistry,
            bond: score.bond,
            energy: score.energy,
            emotionalState: score.emotionalState,
            connectionState: score.connectionState,
            personality: score.personality,
            insight: score.insight,
            atmosphereLevel: score.atmosphereLevel,
            memories: score.memories,
            source: score.source,
            analyzedAt: score.analyzedAt,
          }
        : null,
    })
  )
}
