import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { REFRESH_COOKIE_NAME } from "@/server/auth/cookies"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"
import { checkRateLimit, getClientIp } from "@/server/rate-limit"
import { AUTH_RATE_LIMITS } from "@/server/auth/rate-limits"
import { applyRotatedAuthCookies, rotateAuthSession } from "@/server/auth/refresh"
import { findUserById } from "@/server/repositories/users"
import { verifyCsrfOrigin } from "@/server/auth/require-auth"

export const runtime = "nodejs"

function authMeta(request: Request) {
  return {
    userAgent: request.headers.get("user-agent"),
    ip: getClientIp(request),
  }
}

async function performRefresh(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return {
      ok: false as const,
      response: withCors(
        request,
        jsonError(503, {
          error: "service_unavailable",
          message: "Configure DATABASE_URL and AUTH_SECRET to enable server authentication.",
        })
      ),
    }
  }

  const ip = getClientIp(request)
  const { max, windowMs } = AUTH_RATE_LIMITS.refresh
  const rl = await checkRateLimit(`auth:refresh:${ip}`, max, windowMs)
  if (!rl.ok) {
    return {
      ok: false as const,
      response: withCors(
        request,
        jsonError(
          429,
          { error: "rate_limited", message: "Too many refresh attempts" },
          { headers: { "Retry-After": String(rl.retryAfterSec) } }
        )
      ),
    }
  }

  const jar = await cookies()
  const rawRefresh = jar.get(REFRESH_COOKIE_NAME)?.value
  if (!rawRefresh) {
    return {
      ok: false as const,
      response: withCors(request, jsonError(401, { error: "unauthenticated", message: "No refresh token" })),
    }
  }

  const rotated = await rotateAuthSession(rawRefresh, authMeta(request))
  if (!rotated) {
    return {
      ok: false as const,
      response: withCors(request, jsonError(401, { error: "unauthenticated", message: "Invalid or expired refresh token" })),
    }
  }

  const user = await findUserById(rotated.claims.sub)
  if (!user) {
    return {
      ok: false as const,
      response: withCors(request, jsonError(401, { error: "unauthenticated", message: "User no longer exists" })),
    }
  }

  return { ok: true as const, claims: rotated.claims, user }
}

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/v1/auth/refresh — rotate refresh token and issue new access JWT. */
export async function POST(request: Request) {
  if (!verifyCsrfOrigin(request)) {
    return withCors(request, jsonError(403, { error: "csrf_failed", message: "Invalid origin" }))
  }

  const result = await performRefresh(request)
  if (!result.ok) return result.response

  const res = jsonOk({
    user: { id: result.user.id, email: result.user.email, name: result.user.name },
  })
  await applyRotatedAuthCookies(res, result.claims, authMeta(request))
  log.info("auth_refresh_ok", { userId: result.user.id })
  return withCors(request, res)
}

/** GET /api/v1/auth/refresh?redirect=/app — browser redirect flow when access JWT expired. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirect = url.searchParams.get("redirect") ?? "/app"
  const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/app"

  const result = await performRefresh(request)
  if (!result.ok) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", safeRedirect)
    return NextResponse.redirect(login)
  }

  const res = NextResponse.redirect(new URL(safeRedirect, request.url))
  await applyRotatedAuthCookies(res, result.claims, authMeta(request))
  log.info("auth_refresh_redirect_ok", { userId: result.user.id })
  return res
}
