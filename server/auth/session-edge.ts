import { jwtVerify } from "jose"
import type { NextRequest } from "next/server"

const AUTH_COOKIE_NAME = "ttm_session"

export const DEMO_SESSION_COOKIE = "ttm_demo_session"
export const DEMO_SESSION_HEADER = "x-ttm-demo-session"

const PROTECTED_PREFIXES = ["/app", "/settings", "/admin"] as const

export function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function isDemoModeEnv(): boolean {
  return !process.env.DATABASE_URL?.trim()
}

function getAuthSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET?.trim()
  if (!secret || secret.length < 16) return null
  return new TextEncoder().encode(secret)
}

export async function hasValidJwtSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) return false
  const secret = getAuthSecret()
  if (!secret) return false
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    return typeof payload.sub === "string" && typeof payload.email === "string"
  } catch {
    return false
  }
}

export function hasDemoSession(request: NextRequest): boolean {
  if (request.cookies.get(DEMO_SESSION_COOKIE)?.value === "1") return true
  return request.headers.get(DEMO_SESSION_HEADER) === "1"
}

export async function isRequestAuthenticated(request: NextRequest): Promise<boolean> {
  if (isDemoModeEnv()) {
    return hasDemoSession(request)
  }
  return hasValidJwtSession(request)
}
