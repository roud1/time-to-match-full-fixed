import { NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { getMatchForUser } from "@/server/match-engine/repository"
import {
  clearUserTyping,
  heartbeatPresence,
  isUserOnline,
  isUserTyping,
  setUserTyping,
} from "@/server/realtime/ephemeral"
import { publishPresenceEvent, publishTypingEvent } from "@/server/realtime/broadcast"
import { getRealtimeProvider } from "@/server/realtime/provider"

export const runtime = "nodejs"

const bodySchema = z.object({
  matchId: z.string().min(1),
  typing: z.boolean().optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/realtime/pulse — heartbeat + optional typing indicator */
export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const { matchId, typing } = parsed.data
  const ctx = await getMatchForUser(matchId, session.sub)
  if (!ctx) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
  }

  await heartbeatPresence(session.sub)
  void publishPresenceEvent({ matchId, userId: session.sub, online: true })

  if (typing === true) {
    await setUserTyping(matchId, session.sub)
    void publishTypingEvent({ matchId, userId: session.sub, typing: true })
  } else if (typing === false) {
    await clearUserTyping(matchId, session.sub)
    void publishTypingEvent({ matchId, userId: session.sub, typing: false })
  }

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
