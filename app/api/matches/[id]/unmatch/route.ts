import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit } from "@/lib/server/rate-limit"
import { expireMatchByLikeId } from "@/lib/server/match-engine/repository"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/matches/:id/unmatch — expire match server-side */
export async function POST(request: Request, context: RouteContext) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ ok: true, mode: "demo" as const }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const { id: likeId } = await context.params
  if (!likeId?.trim() || likeId.startsWith("local:")) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  const rl = await checkRateLimit(`unmatch:${session.sub}`, 20, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(request, jsonError(429, { error: "rate_limited", message: "Too many unmatch requests" }))
  }

  const result = await expireMatchByLikeId(likeId.trim(), session.sub)
  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : result.code === "forbidden" ? 403 : 400
    return withCors(
      request,
      jsonError(status, { error: result.code ?? "error", message: "Could not unmatch" })
    )
  }

  return withCors(request, jsonOk({ ok: true, status: "expired" }))
}
