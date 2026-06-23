import { NextResponse } from "next/server"
import Pusher from "pusher"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { getMatchForUser } from "@/server/match-engine/repository"
import { parseMatchIdFromChannel } from "@/server/realtime/channels"
import { getRealtimeProvider } from "@/server/realtime/provider"

export const runtime = "nodejs"

function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER ?? "eu"
  if (!appId || !key || !secret) return null
  return new Pusher({ appId, key, secret, cluster, useTLS: true })
}

async function parseAuthBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")])
    )
  }
  const form = await request.formData()
  const out: Record<string, string> = {}
  for (const [k, v] of form.entries()) {
    out[k] = typeof v === "string" ? v : ""
  }
  return out
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/realtime/auth — private channel auth (Pusher) */
export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const provider = getRealtimeProvider()
  if (provider !== "pusher") {
    return withCors(
      request,
      jsonError(503, { error: "not_configured", message: "Pusher realtime not configured" })
    )
  }

  const pusher = getPusherServer()
  if (!pusher) {
    return withCors(
      request,
      jsonError(503, { error: "not_configured", message: "Pusher credentials missing" })
    )
  }

  let fields: Record<string, string>
  try {
    fields = await parseAuthBody(request)
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_body", message: "Invalid auth body" }))
  }

  const socketId = fields.socket_id?.trim()
  const channelName = fields.channel_name?.trim()
  if (!socketId || !channelName) {
    return withCors(
      request,
      jsonError(400, { error: "invalid_body", message: "socket_id and channel_name required" })
    )
  }

  const matchId = parseMatchIdFromChannel(channelName)
  if (!matchId) {
    return withCors(request, jsonError(403, { error: "forbidden", message: "Unknown channel" }))
  }

  const ctx = await getMatchForUser(matchId, session.sub)
  if (!ctx) {
    return withCors(request, jsonError(403, { error: "forbidden", message: "Not a match participant" }))
  }

  const auth = pusher.authorizeChannel(socketId, channelName)
  return withCors(request, jsonOk(auth))
}
