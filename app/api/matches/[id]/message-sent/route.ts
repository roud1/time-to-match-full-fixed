import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import type { MessageSentResponse } from "@/lib/server/matches/types"
import { checkAndGrantAchievements } from "@/lib/server/gamification/check"
import { recordMessageSentForMatch } from "@/lib/server/repositories/match-stats"
import { findMatchByIdForUser } from "@/lib/server/repositories/likes"

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

  const { id: matchId } = await context.params
  if (!matchId?.trim() || matchId.startsWith("local:")) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  const result = await recordMessageSentForMatch(matchId.trim(), session.sub)

  if (!result.ok) {
    if (result.code === "expired") {
      return withCors(request, jsonError(410, { error: "expired", message: "Match has expired" }))
    }
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const gamification = await checkAndGrantAchievements(session.sub, {
    event: "message_sent",
    matchId: matchId.trim(),
    messageCount: result.payload.totalMessages,
    bondProlonged: result.payload.prolonged,
    prolongCount: result.payload.prolongCount,
    at: new Date(),
  })

  const payload: MessageSentResponse = {
    ...result.payload,
    systemMessage: result.payload.prolonged ? SYSTEM_MSG_RU : undefined,
    gamification,
  }

  if (result.payload.prolonged && !payload.newExpiresAt) {
    const refreshed = await findMatchByIdForUser(matchId.trim(), session.sub)
    payload.newExpiresAt = refreshed?.expires_at?.toISOString()
  }

  return withCors(request, jsonOk(payload))
}
