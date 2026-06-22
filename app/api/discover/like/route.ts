import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit } from "@/lib/server/rate-limit"
import { recordLikeForUser } from "@/lib/server/repositories/likes"
import { discoverSwipeBodySchema } from "@/lib/server/validation/discover-swipe"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/discover/like — record a like; creates match on mutual like */
export async function POST(request: Request) {
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

  const rl = await checkRateLimit(`discover-like:${session.sub}`, 120, 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(
        429,
        { error: "rate_limited", message: "Too many swipe requests" },
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

  const parsed = discoverSwipeBodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const result = await recordLikeForUser(session.sub, parsed.data.targetUserId)
  if (!result.ok) {
    const status = result.code === "blocked" ? 403 : 404
    return withCors(
      request,
      jsonError(status, {
        error: result.code,
        message:
          result.code === "self"
            ? "Cannot like yourself"
            : result.code === "blocked"
              ? "Account blocked"
              : "Target user not found",
      })
    )
  }

  if (result.matched) {
    return withCors(
      request,
      jsonOk({ liked: true, matched: true, matchId: result.matchId })
    )
  }

  return withCors(request, jsonOk({ liked: true, matched: false }))
}
