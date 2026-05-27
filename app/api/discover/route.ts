import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { findUserById } from "@/lib/server/repositories/users"
import { listDiscoverProfiles } from "@/lib/server/repositories/discover"
import type { DiscoverFilters } from "@/lib/discover/types"

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
    purpose: searchParams.get("purpose") || undefined,
    gender: searchParams.get("gender") === "male" || searchParams.get("gender") === "female"
      ? searchParams.get("gender") as "male" | "female"
      : undefined,
    minAge: parseIntParam(searchParams.get("minAge")),
    maxAge: parseIntParam(searchParams.get("maxAge")),
    maxDistance: parseIntParam(searchParams.get("maxDistance")),
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

  const profiles = await listDiscoverProfiles({
    viewerId: session.sub,
    filters,
    viewerLat: Number.isFinite(viewerLat) ? viewerLat : null,
    viewerLng: Number.isFinite(viewerLng) ? viewerLng : null,
  })

  return withCors(request, jsonOk({ profiles }))
}
