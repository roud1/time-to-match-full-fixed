import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { requirePremium } from "@/server/monetization/access"
import { countIncomingLikesForUser, listIncomingLikesForUser, listIncomingLikeTeasers } from "@/server/repositories/likes"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/likes/incoming — premium: who liked you */
export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ profiles: [], count: 0, premiumRequired: false }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const premium = await requirePremium(session.sub)
  const count = await countIncomingLikesForUser(session.sub)

  if (!premium.ok) {
    const teasers = await listIncomingLikeTeasers(session.sub, 8)
    return withCors(
      request,
      jsonOk({
        profiles: [],
        teasers,
        count,
        premiumRequired: true,
        code: "premium_required",
      })
    )
  }

  const profiles = await listIncomingLikesForUser(session.sub)
  return withCors(request, jsonOk({ profiles, count: profiles.length, premiumRequired: false }))
}
