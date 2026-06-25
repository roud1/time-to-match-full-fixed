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
  const filters: DiscoverFilters = {
    purpose: searchParams.get("purpose") || user.purpose || undefined,
    gender: searchParams.get("gender") === "male" || searchParams.get("gender") === "female"
      ? searchParams.get("gender") as "male" | "female"
      : undefined,
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
