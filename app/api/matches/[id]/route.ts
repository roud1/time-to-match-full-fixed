import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import {
  ensureEngineMatchForLike,
  getMatchDetailForUser,
} from "@/lib/server/match-engine/repository"
import { findMatchByIdForUser } from "@/lib/server/repositories/likes"
import { bondStatsFromRow } from "@/lib/server/repositories/match-stats"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/matches/:id — match detail + messages + expiry state */
export async function GET(request: Request, context: RouteContext) {
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

  const { id: likeId } = await context.params
  if (!likeId?.trim() || likeId.startsWith("local:")) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  await ensureEngineMatchForLike(likeId.trim(), session.sub)

  const detail = await getMatchDetailForUser(likeId.trim(), session.sub)
  if (!detail) {
    const like = await findMatchByIdForUser(likeId.trim(), session.sub)
    if (!like) {
      return withCors(request, jsonError(404, { error: "not_found", message: "Match not found" }))
    }
    return withCors(
      request,
      jsonOk({
        match: {
          id: like.id,
          peerUserId: like.to_user,
          peerName: like.peer_name,
          expiresAt: (like.expires_at ?? new Date()).toISOString(),
          status: like.is_expired ? "expired" : "new_match",
          isExpired: like.is_expired,
          messages: [],
          bond: bondStatsFromRow(
            like.stat_total_messages != null
              ? {
                  total_messages: like.stat_total_messages,
                  prolong_count: like.stat_prolong_count ?? 0,
                  last_prolonged_at: like.stat_last_prolonged_at,
                }
              : null
          ),
        },
      })
    )
  }

  const like = await findMatchByIdForUser(likeId.trim(), session.sub)

  return withCors(
    request,
    jsonOk({
      match: {
        ...detail,
        isFrozen: like?.is_frozen ?? false,
        bond: bondStatsFromRow(
          like?.stat_total_messages != null
            ? {
                total_messages: like.stat_total_messages,
                prolong_count: like.stat_prolong_count ?? 0,
                last_prolonged_at: like.stat_last_prolonged_at,
              }
            : null
        ),
      },
    })
  )
}
