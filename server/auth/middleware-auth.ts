import { jwtVerify } from "jose"
import type { NextRequest } from "next/server"
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/server/auth/cookies"
import type { SessionClaims } from "@/server/auth/jwt"

export const DEMO_SESSION_COOKIE = "ttm_demo_session"
export const DEMO_SESSION_HEADER = "x-ttm-demo-session"

const PROTECTED_PAGE_PREFIXES = ["/app", "/settings", "/admin"] as const

/** API routes that do not require a valid access JWT in middleware. */
const PUBLIC_API_EXACT = new Set([
  "/api/health",
  "/api/ready",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
  "/api/billing/webhook",
  "/api/realtime/auth",
])

const PUBLIC_API_PREFIXES = ["/api/v1/cron/", "/api/admin/session"] as const

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function isPublicApiPath(pathname: string): boolean {
  if (PUBLIC_API_EXACT.has(pathname)) return true
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))
}

export function isProtectedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") && !isPublicApiPath(pathname)
}

export function isDemoModeEnv(): boolean {
  return !process.env.DATABASE_URL?.trim()
}

function getAuthSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET?.trim()
  if (!secret || secret.length < 16) return null
  return new TextEncoder().encode(secret)
}

export async function verifyAccessFromRequest(request: NextRequest): Promise<SessionClaims | null> {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  if (!token) return null
  const secret = getAuthSecret()
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    const sub = typeof payload.sub === "string" ? payload.sub : null
    const email = typeof payload.email === "string" ? payload.email : null
    if (!sub || !email) return null
    return { sub, email }
  } catch {
    return null
  }
}

/** @deprecated Use verifyAccessFromRequest */
export async function hasValidJwtSession(request: NextRequest): Promise<boolean> {
  return (await verifyAccessFromRequest(request)) !== null
}

export function hasRefreshCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value)
}

export function hasDemoSession(request: NextRequest): boolean {
  if (request.cookies.get(DEMO_SESSION_COOKIE)?.value === "1") return true
  return request.headers.get(DEMO_SESSION_HEADER) === "1"
}

export async function isRequestAuthenticated(request: NextRequest): Promise<boolean> {
  if (isDemoModeEnv()) {
    return hasDemoSession(request)
  }
  return (await verifyAccessFromRequest(request)) !== null
}

export function buildRefreshRedirectUrl(request: NextRequest, returnPath: string): URL {
  const url = new URL("/api/v1/auth/refresh", request.url)
  url.searchParams.set("redirect", returnPath)
  return url
}
