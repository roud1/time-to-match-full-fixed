import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/server/auth/jwt"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { findUserById } from "@/server/repositories/users"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(
      request,
      jsonError(503, {
        error: "service_unavailable",
        message: "Configure DATABASE_URL and AUTH_SECRET to enable server authentication.",
      })
    )
  }

  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const claims = await verifySessionToken(token)
  if (!claims) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "Invalid or expired session" }))
  }

  const user = await findUserById(claims.sub)
  if (!user) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "User no longer exists" }))
  }

  return withCors(
    request,
    jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile,
        profileExpiresAt: user.profile_expires_at,
        purpose: user.purpose ?? null,
        gender: user.gender ?? null,
        ageMin: user.age_min ?? null,
        ageMax: user.age_max ?? null,
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
        maxDistance: user.max_distance ?? 50,
        freeze_balance: user.freeze_balance ?? 0,
        last_freeze_at: user.last_freeze_at?.toISOString() ?? null,
        email_verified: user.email_verified ?? false,
        has_push_subscription: Boolean(user.push_subscription?.endpoint),
      },
    })
  )
}
