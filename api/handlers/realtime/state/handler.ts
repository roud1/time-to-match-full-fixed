import { NextResponse } from "next/server"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { getMatchForUser } from "@/server/match-engine/repository"
import { heartbeatPresence, isUserOnline, isUserTyping } from "@/server/realtime/ephemeral"
import { publishPresenceEvent } from "@/server/realtime/broadcast"
import { getRealtimeProvider } from "@/server/realtime/provider"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/realtime/state?matchId= — poll partner typing + presence */
export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const matchId = new URL(request.url).searchParams.get("matchId")?.trim()
  if (!matchId) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "matchId required" }))
  }

  const ctx = await getMatchForUser(matchId, session.sub)
  if (!ctx) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  await heartbeatPresence(session.sub)
  void publishPresenceEvent({ matchId, userId: session.sub, online: true })

  const peerId = ctx.match.user1_id === session.sub ? ctx.match.user2_id : ctx.match.user1_id
  const [partnerTyping, partnerOnline] = await Promise.all([
    isUserTyping(matchId, peerId),
    isUserOnline(peerId),
  ])

  return withCors(
    request,
    jsonOk({
      partnerTyping,
      partnerOnline,
      provider: getRealtimeProvider(),
    })
  )
}
