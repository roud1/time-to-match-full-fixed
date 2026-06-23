import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import {
  ensureEngineMatchForLike,
  sendMatchMessage,
} from "@/server/match-engine/repository"
import { checkAndGrantAchievements } from "@/server/gamification/check"
import type { MessageSentResponse } from "@/server/matches/types"
import { publishMessageEvent } from "@/server/realtime/broadcast"
import { recordMessageSentForMatch } from "@/server/repositories/match-stats"
import { matchMessageBodySchema } from "@/server/validation/match-message"
import { isValidMatchRouteId, resolveMatchRouteId } from "@/server/matches/resolve-id"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const SYSTEM_MSG_RU =
  "💬 Вы хорошо общаетесь — мэтч продлён на 6 часов"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/matches/:id/message — send message + lifecycle transition + bond */
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON body" }))
  }

  const parsed = matchMessageBodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const trimmedId = likeId
  await ensureEngineMatchForLike(trimmedId, session.sub)

  const sent = await sendMatchMessage({
    likeId: trimmedId,
    senderId: session.sub,
    body: parsed.data.text,
  })

  if (!sent.ok) {
    if (sent.code === "expired") {
      return withCors(request, jsonError(410, { error: "expired", message: "Match has expired" }))
    }
    if (sent.code === "forbidden") {
      return withCors(request, jsonError(403, { error: "forbidden", message: "Not allowed" }))
    }
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  const { integrateMessageSent } = await import("@/server/engines/integration")
  const { findLikeContext } = await import("@/server/match-engine/repository")
  const canonicalId = await findLikeContext(trimmedId, session.sub)
  if (canonicalId?.match_id) {
    await integrateMessageSent({
      canonicalMatchId: canonicalId.match_id,
      senderId: session.sub,
      statusBefore: sent.statusBefore,
      statusAfter: sent.statusAfter,
      messageCreatedAt: new Date(sent.message.createdAt),
    })
  }

  const bondResult = await recordMessageSentForMatch(trimmedId, session.sub)
  const bondPayload: MessageSentResponse | undefined =
    bondResult.ok ? bondResult.payload : undefined

  void publishMessageEvent({ matchId: trimmedId, userId: session.sub })

  const gamification = await checkAndGrantAchievements(session.sub, {
    event: "message_sent",
    matchId: trimmedId,
    messageCount: bondPayload?.totalMessages,
    bondProlonged: bondPayload?.prolonged,
    prolongCount: bondPayload?.prolongCount,
    at: new Date(),
  })

  return withCors(
    request,
    jsonOk({
      message: sent.message,
      match: sent.match,
      statusBefore: sent.statusBefore,
      statusAfter: sent.statusAfter,
      bond: bondPayload,
      systemMessage: bondPayload?.prolonged ? SYSTEM_MSG_RU : undefined,
      gamification,
    })
  )
}
