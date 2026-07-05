import { NextResponse } from "next/server"
import { verifyPassword } from "@/server/auth/password"
import { issueAuthCookies } from "@/server/auth/refresh"
import { AUTH_RATE_LIMITS } from "@/server/auth/rate-limits"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"
import { checkRateLimit, getClientIp } from "@/server/rate-limit"
import { findUserForAuthByEmail } from "@/server/repositories/users"
import { loginBodySchema } from "@/server/validation/auth"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
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

  const ip = getClientIp(request)
  const { max, windowMs } = AUTH_RATE_LIMITS.login
  const rl = await checkRateLimit(`auth:login:${ip}`, max, windowMs)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited", message: "Too many attempts" }, { headers: { "Retry-After": String(rl.retryAfterSec) } })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Body must be JSON" }))
  }

  const parsed = loginBodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const email = parsed.data.email.trim().toLowerCase()
  const row = await findUserForAuthByEmail(email)
  const valid = row && (await verifyPassword(parsed.data.password, row.password_hash))

  if (!valid || !row) {
    log.warn("auth_login_fail", { email })
    return withCors(
      request,
      jsonError(401, { error: "invalid_credentials", message: "Invalid email or password" })
    )
  }

  // Block check — must happen AFTER password verify to avoid user enumeration
  if (row.is_blocked) {
    log.warn("auth_login_blocked", { userId: row.id, reason: row.block_reason })
    return withCors(
      request,
      jsonError(403, {
        error: "account_blocked",
        message: row.block_reason
          ? `Your account has been suspended: ${row.block_reason}`
          : "Your account has been suspended. Contact support for more information.",
      })
    )
  }

  if (!row.is_active) {
    log.warn("auth_login_inactive", { userId: row.id })
    return withCors(
      request,
      jsonError(403, {
        error: "account_inactive",
        message: "This account is inactive. Please contact support.",
      })
    )
  }

  const res = jsonOk({ user: { id: row.id, email: row.email, name: row.name } })
  await issueAuthCookies(
    res,
    { sub: row.id, email: row.email },
    { userAgent: request.headers.get("user-agent"), ip }
  )
  log.info("auth_login_ok", { userId: row.id })
  return withCors(request, res)
}
