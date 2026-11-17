import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { findUserById } from "@/server/repositories/users"
import { matchingService } from "@/server/matching"
import type { DiscoverFilters } from "@/client/lib/discover/types"

export const runtime = "nodejs"

function parseIntParam(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Who the viewer wants to see when the request has no explicit gender filter:
 * profile.lookingFor ("men" / "women" / "all"), else the opposite of the viewer's gender.
 */
function defaultShowGender(user: { gender: "male" | "female" | null; profile: Record<string, unknown> }) {
  const lookingFor = user.profile?.lookingFor
  if (lookingFor === "men") return "male" as const
  if (lookingFor === "women") return "female" as const
  if (lookingFor === "all") return undefined
  const own = user.gender ?? (user.profile?.gender === "male" || user.profile?.gender === "female" ? user.profile.gender : null)
  if (own === "male") return "female" as const
  if (own === "female") return "male" as const
  return undefined
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ profiles: [] }))
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const user = await findUserById(session.sub)
  if (!user) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "User not found" }))
  }

  const { searchParams } = new URL(request.url)
  const genderParam = searchParams.get("gender")
  const filters: DiscoverFilters = {
    purpose: searchParams.get("purpose") || user.purpose || undefined,
    gender:
      genderParam === "male" || genderParam === "female"
        ? genderParam
        : genderParam === "all"
          ? undefined
          : defaultShowGender(user),
    ageMin:
      parseIntParam(searchParams.get("ageMin")) ??
      parseIntParam(searchParams.get("minAge")) ??
      user.age_min ??
      undefined,
    ageMax:
      parseIntParam(searchParams.get("ageMax")) ??
      parseIntParam(searchParams.get("maxAge")) ??
      user.age_max ??
      undefined,
    maxDistance: parseIntParam(searchParams.get("maxDistance")) ?? user.max_distance,
  }

  const latParam = searchParams.get("lat")
  const lngParam = searchParams.get("lng")
  const viewerLat =
    latParam != null && latParam !== ""
      ? Number(latParam)
      : user.latitude
  const viewerLng =
    lngParam != null && lngParam !== ""
      ? Number(lngParam)
      : user.longitude

  const profiles = await matchingService.getDiscoverFeed({
    viewerId: session.sub,
    filters,
    viewerLat: Number.isFinite(viewerLat) ? viewerLat : null,
    viewerLng: Number.isFinite(viewerLng) ? viewerLng : null,
    cursor: searchParams.get("cursor"),
    limit: parseIntParam(searchParams.get("limit")),
  })

  const nextCursor = profiles.length > 0 ? profiles[profiles.length - 1]?.id ?? null : null

  return withCors(request, jsonOk({ profiles, nextCursor }))
}
