import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { isOpenRouterConfigured } from "@/server/openrouter"
import {
  getLatestConnectionScore,
  hasPendingAiAnalysisJob,
} from "@/server/repositories/ai-analysis"
import { findMatchByIdForUser } from "@/server/repositories/likes"
import { isConnectionAnalyzing } from "@/server/realtime/ephemeral"
import { isValidMatchRouteId, resolveMatchRouteId } from "@/server/matches/resolve-id"

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

  const { id } = await context.params
  if (!isValidMatchRouteId(id)) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  const resolved = await resolveMatchRouteId(id, session.sub)
  if (!resolved) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const likeId = resolved.likeId
  const like = await findMatchByIdForUser(likeId, session.sub)
  if (!like) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const [score, analyzing, pending] = await Promise.all([
    getLatestConnectionScore(likeId),
    isConnectionAnalyzing(likeId),
    hasPendingAiAnalysisJob(likeId),
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
