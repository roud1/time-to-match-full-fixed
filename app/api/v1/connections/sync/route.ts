import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { getUserAppState, upsertUserAppState } from "@/lib/server/repositories/app-state"
import { connectionSyncBodySchema } from "@/lib/server/validation/connections-sync"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ synced: false, reason: "database_not_configured" }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "Server session required" }))
  }

  const state = await getUserAppState(session.sub)
  if (!state) {
    return withCors(request, jsonOk({ synced: true, state: null }))
  }

  return withCors(request, jsonOk({ synced: true, state }))
}

export async function PUT(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ synced: false, reason: "database_not_configured" }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "Server session required" }))
  }

  const ip = getClientIp(request)
  const rl = checkRateLimit(`sync:${session.sub}`, 60, 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(
        429,
        { error: "rate_limited", message: "Too many sync requests" },
        { headers: { "Retry-After": String(rl.retryAfterSec) } }
      )
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON body" }))
  }

  const parsed = connectionSyncBodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const ok = await upsertUserAppState(session.sub, {
    version: parsed.data.version,
    connections: parsed.data.connections,
    memories: parsed.data.memories,
    recentEvents: parsed.data.recentEvents ?? [],
  })

  return withCors(request, jsonOk({ synced: ok, savedAt: Date.now() }))
}
