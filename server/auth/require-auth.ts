import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyAccessToken, type SessionClaims } from "@/server/auth/jwt"
import { ACCESS_COOKIE_NAME } from "@/server/auth/cookies"
import { jsonError } from "@/server/http"

export type AuthResult =
  | { ok: true; session: SessionClaims }
  | { ok: false; response: NextResponse }

export async function getSessionFromRequest(): Promise<SessionClaims | null> {
  const jar = await cookies()
  const token = jar.get(ACCESS_COOKIE_NAME)?.value
  if (!token) return null
  return verifyAccessToken(token)
}

export async function requireAuth(request?: Request): Promise<AuthResult> {
  const session = await getSessionFromRequest()
  if (!session) {
    const res = jsonError(401, { error: "unauthenticated", message: "No session" })
    if (request) {
      const { withCors } = await import("@/server/http")
      return { ok: false, response: withCors(request, res) }
    }
    return { ok: false, response: res }
  }

  if (request && !verifyCsrfOrigin(request)) {
    const res = jsonError(403, { error: "csrf_failed", message: "Invalid origin" })
    const { withCors } = await import("@/server/http")
    return { ok: false, response: withCors(request, res) }
  }

  return { ok: true, session }
}

export async function optionalAuth(): Promise<SessionClaims | null> {
  return getSessionFromRequest()
}

/**
 * Same-origin check for cookie-authenticated mutating requests.
 * Skipped when Authorization header is present (Bearer token clients).
 */
export function verifyCsrfOrigin(request: Request): boolean {
  const method = request.method.toUpperCase()
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true
  if (request.headers.get("authorization")?.startsWith("Bearer ")) return true

  const host = request.headers.get("host")
  if (!host) return false

  const origin = request.headers.get("origin")
  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  const referer = request.headers.get("referer")
  if (referer) {
    try {
      return new URL(referer).host === host
    } catch {
      return false
    }
  }

  return false
}
