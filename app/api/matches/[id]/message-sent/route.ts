import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import type { MessageSentResponse } from "@/lib/server/matches/types"
import { checkAndGrantAchievements } from "@/lib/server/gamification/check"
import { recordMessageSentForMatch } from "@/lib/server/repositories/match-stats"
import { findMatchByIdForUser } from "@/lib/server/repositories/likes"
import { maybeQueueConnectionAnalysis } from "@/lib/server/connection-ai-worker"
import { isValidMatchRouteId, resolveMatchRouteId } from "@/lib/server/matches/resolve-id"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const SYSTEM_MSG_RU =
  "💬 Вы хорошо общаетесь — мэтч продлён на 6 часов"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request, context: RouteContext) {
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
  const result = await recordMessageSentForMatch(likeId, session.sub)

  if (!result.ok) {
    if (result.code === "expired") {
      return withCors(request, jsonError(410, { error: "expired", message: "Match has expired" }))
    }
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const gamification = await checkAndGrantAchievements(session.sub, {
    event: "message_sent",
    matchId: likeId,
    messageCount: result.payload.totalMessages,
    bondProlonged: result.payload.prolonged,
    prolongCount: result.payload.prolongCount,
    at: new Date(),
  })

  const analysisQueued = maybeQueueConnectionAnalysis(
    session.sub,
    likeId,
    result.payload.totalMessages
  )

  const payload: MessageSentResponse = {
    ...result.payload,
    systemMessage: result.payload.prolonged ? SYSTEM_MSG_RU : undefined,
    gamification,
    analysisQueued,
  }

  if (result.payload.prolonged && !payload.newExpiresAt) {
    const refreshed = await findMatchByIdForUser(likeId, session.sub)
    payload.newExpiresAt = refreshed?.expires_at?.toISOString()
  }

  return withCors(request, jsonOk(payload))
}
