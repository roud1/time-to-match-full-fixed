import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, authCookieOptions, signSessionToken } from "@/lib/server/auth/jwt"
import { hashPassword } from "@/lib/server/auth/password"
import { getServerEnv } from "@/lib/server/env"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"
import { createUser, findUserByEmail } from "@/lib/server/repositories/users"
import { registerBodySchema, sanitizeDisplayName } from "@/lib/server/validation/auth"

function isPgUniqueViolation(e: unknown) {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "23505"
}


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
  const rl = await checkRateLimit(`auth:register:${ip}`, 8, 15 * 60 * 1000)
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

  const parsed = registerBodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const name = sanitizeDisplayName(parsed.data.name)
  if (!name) return withCors(request, jsonError(400, { error: "validation_error", message: "Invalid name" }))

  const email = parsed.data.email.trim().toLowerCase()
  const passwordHash = await hashPassword(parsed.data.password)
  const profileExpiresAt: Date | null = null

  try {
    if (await findUserByEmail(email)) {
      return withCors(request, jsonError(409, { error: "email_taken", message: "Email already registered" }))
    }

    const id = await createUser({
      email,
      passwordHash,
      name,
      profile: {},
      profileExpiresAt,
    })
    if (!id) {
      return withCors(request, jsonError(500, { error: "create_failed", message: "Could not create user" }))
    }

    const token = await signSessionToken({ sub: id, email })
    const res = jsonOk({ user: { id, email, name } })
    res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions())
    log.info("auth_register_ok", { userId: id })
    return withCors(request, res)
  } catch (e) {
    if (isPgUniqueViolation(e)) {
      return withCors(request, jsonError(409, { error: "email_taken", message: "Email already registered" }))
    }
    log.error("auth_register_err", { err: e instanceof Error ? e.message : String(e) })
    return withCors(request, jsonError(500, { error: "internal_error", message: "Registration failed" }))
  }
}
