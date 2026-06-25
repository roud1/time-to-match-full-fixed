import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { checkUserActionRate } from "@/server/rate-limit-actions"
import { trackServerEvent } from "@/server/analytics/track"
import { matchingService } from "@/server/matching"
import { discoverSwipeBodySchema } from "@/server/validation/discover-swipe"

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

  const actionRl = await checkUserActionRate(session.sub)
  if (!actionRl.ok) {
    return withCors(
      request,
      jsonError(
        429,
        { error: "rate_limited", message: "Too many actions per minute" },
        { headers: { "Retry-After": String(actionRl.retryAfterSec) } }
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

  const result = await matchingService.recordLike(session.sub, parsed.data.targetUserId, {
    superLike: parsed.data.superLike,
  })
  if (!result.ok) {
    if (result.code === "like_limit_reached") {
      return withCors(
        request,
        jsonError(429, {
          error: "LIKE_LIMIT_REACHED",
          code: "LIKE_LIMIT_REACHED",
          message: "Daily like limit reached",
          remaining: result.remaining ?? 0,
        })
      )
    }
    if (result.code === "super_like_limit_reached") {
      return withCors(
        request,
        jsonError(403, {
          error: "SUPER_LIKE_LIMIT_REACHED",
          code: "SUPER_LIKE_LIMIT_REACHED",
          message: "Daily super like limit reached",
          remaining: result.remaining ?? 0,
        })
      )
    }
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
    void trackServerEvent("match", { userId: session.sub, properties: { targetUserId: parsed.data.targetUserId } })
    return withCors(
      request,
      jsonOk({ liked: true, matched: true, matchId: result.matchId })
    )
  }

  void trackServerEvent("like", { userId: session.sub, properties: { targetUserId: parsed.data.targetUserId } })
  return withCors(request, jsonOk({ liked: true, matched: false }))
}
