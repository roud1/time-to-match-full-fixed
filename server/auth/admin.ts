import { cookies } from "next/headers"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/server/auth/admin-session"

function readRequestCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie")
  if (!header) return undefined

  for (const part of header.split(";")) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf("=")
    if (eq < 0) continue
    const key = trimmed.slice(0, eq)
    if (key !== name) continue
    return decodeURIComponent(trimmed.slice(eq + 1))
  }

  return undefined
}

/** Legacy sync check — header only. Prefer `isAdminRequestAsync` in route handlers. */
export function isAdminRequest(request: Request): boolean {
  const key = process.env.ADMIN_API_KEY
  if (!key || key.length < 8) return false
  const header = request.headers.get("x-admin-key")
  return header === key
}

/** Admin API via HttpOnly `ttm_admin_session` cookie or legacy `x-admin-key` header. */
export async function isAdminRequestAsync(request: Request): Promise<boolean> {
  const key = process.env.ADMIN_API_KEY
  if (!key || key.length < 8) return false

  const header = request.headers.get("x-admin-key")
  if (header === key) return true

  const cookieToken = readRequestCookie(request, ADMIN_SESSION_COOKIE)
  if (!cookieToken) return false

  return verifyAdminSessionToken(cookieToken)
}

export async function isAdminSessionFromCookies(): Promise<boolean> {
  const key = process.env.ADMIN_API_KEY
  if (!key || key.length < 8) return false

  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return false

  return verifyAdminSessionToken(token)
}

export function adminNotConfigured(): boolean {
  return !process.env.ADMIN_API_KEY
}
