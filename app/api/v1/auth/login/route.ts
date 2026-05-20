import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, authCookieOptions, signSessionToken } from "@/lib/server/auth/jwt"
import { verifyPassword } from "@/lib/server/auth/password"
import { getServerEnv } from "@/lib/server/env"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"
import { findUserForAuthByEmail } from "@/lib/server/repositories/users"
import { loginBodySchema } from "@/lib/server/validation/auth"

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
  const rl = checkRateLimit(`auth:login:${ip}`, 20, 15 * 60 * 1000)
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

  const token = await signSessionToken({ sub: row.id, email: row.email })
  const res = jsonOk({ user: { id: row.id, email: row.email, name: row.name } })
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions())
  log.info("auth_login_ok", { userId: row.id })
  return withCors(request, res)
}
