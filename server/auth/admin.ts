import { cookies } from "next/headers"
import { getDb } from "@/server/db"
import { getSessionFromRequest } from "@/server/auth/require-auth"
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

/** Emails that get admin rights (env ADMIN_EMAILS, comma separated). */
function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

/**
 * Signed-in account with admin rights: users.role = 'admin', or a VERIFIED email listed in
 * ADMIN_EMAILS (then the role is saved). Verification matters: otherwise anyone could register
 * the owner's address before the owner does.
 */
export async function isAdminAccount(): Promise<boolean> {
  const session = await getSessionFromRequest().catch(() => null)
  return session ? isAdminUser(session.sub) : false
}

/** Admin check by user id (no request needed): role 'admin' or a verified ADMIN_EMAILS address. */
export async function isAdminUser(userId: string): Promise<boolean> {
  const db = getDb()
  if (!db || !userId) return false
  try {
    const [u] = await db<{ email: string; role: string; email_verified: boolean }[]>`
      SELECT email, role, email_verified FROM users WHERE id = ${userId}
    `
    if (!u) return false
    if (u.role === "admin") return true
    if (u.email_verified && adminEmails().has(u.email.trim().toLowerCase())) {
      await db`UPDATE users SET role = 'admin' WHERE id = ${userId}`
      return true
    }
  } catch {
    /* treat as not admin */
  }
  return false
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
  if (key && key.length >= 8) {
    if (request.headers.get("x-admin-key") === key) return true
    const cookieToken = readRequestCookie(request, ADMIN_SESSION_COOKIE)
    if (cookieToken && (await verifyAdminSessionToken(cookieToken))) return true
  }
  // Signed-in admin account (no key needed).
  return isAdminAccount()
}

export async function isAdminSessionFromCookies(): Promise<boolean> {
  const key = process.env.ADMIN_API_KEY
  if (key && key.length >= 8) {
    const jar = await cookies()
    const token = jar.get(ADMIN_SESSION_COOKIE)?.value
    if (token && (await verifyAdminSessionToken(token))) return true
  }
  return isAdminAccount()
}

/** Admin is available through the key, admin emails, or (always) accounts with role 'admin'. */
export function adminNotConfigured(): boolean {
  return false
}
