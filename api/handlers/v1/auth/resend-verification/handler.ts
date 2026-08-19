/**
 * POST /api/v1/auth/resend-verification
 * Resends email verification for an unverified account.
 * Rate-limited to prevent abuse.
 */
import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"
import { checkRateLimit, getClientIp } from "@/server/rate-limit"
import { findUserForAuthByEmail } from "@/server/repositories/users"
import { verifyPassword } from "@/server/auth/password"
import { sendVerificationEmail } from "@/server/email/verification"
import { z } from "zod"

export const runtime = "nodejs"

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable" }))
  }

  // Rate limit: max 3 resend attempts per IP per 15 minutes
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth:resend-verify:${ip}`, 3, 15 * 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited", message: "Too many requests. Try again in 15 minutes." })
    )
  }

  let body: unknown
  try { body = await request.json() } catch {
    return withCors(request, jsonError(400, { error: "invalid_json" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonError(400, { error: "validation_error", message: "Email and password required." }))
  }

  const { email, password } = parsed.data
  const row = await findUserForAuthByEmail(email.trim().toLowerCase())

  // Always return success to avoid user enumeration
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return withCors(request, jsonOk({ sent: true }))
  }

  if (row.email_verified) {
    return withCors(request, jsonOk({ sent: false, reason: "already_verified" }))
  }

  const sent = await sendVerificationEmail(row.id, row.email, row.name)
  log.info("auth_resend_verification", { userId: row.id, sent })

  return withCors(request, jsonOk({ sent: true }))
}
