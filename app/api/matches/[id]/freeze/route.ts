import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { checkAndGrantAchievements } from "@/lib/server/gamification/check"
import { freezeMatchForUser } from "@/lib/server/repositories/likes"

export const runtime = "nodejs"

const NO_FREEZES_MESSAGE = "Купите заморозку"

type RouteContext = { params: Promise<{ id: string }> }

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
  if (!matchId?.trim()) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Match id required" }))
  }

  const result = await freezeMatchForUser(matchId.trim(), session.sub)

  if (!result.ok) {
    switch (result.code) {
      case "no_freezes":
        return withCors(
          request,
          jsonError(402, {
            error: "NO_FREEZES",
            message: NO_FREEZES_MESSAGE,
          })
        )
      case "expired":
        return withCors(
          request,
          jsonError(410, { error: "expired", message: "Match has expired" })
        )
      case "not_found":
      default:
        return withCors(
          request,
          jsonError(404, { error: "not_found", message: "Match not found" })
        )
    }
  }

  const gamification = await checkAndGrantAchievements(session.sub, {
    event: "freeze_used",
    matchId: matchId.trim(),
  })

  return withCors(
    request,
    jsonOk({ match: result.match, gamification } satisfies {
      match: typeof result.match
      gamification: typeof gamification
    })
  )
}
