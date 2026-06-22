import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { sendEmail } from "@/lib/server/email/send-email"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"
import { findUserForAuthByEmail } from "@/lib/server/repositories/users"
import { createPasswordResetToken } from "@/lib/server/repositories/password-reset"
import { forgotPasswordBodySchema } from "@/lib/server/validation/auth"

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
        message: "Password reset is not available in demo mode.",
      })
    )
  }

  const ip = getClientIp(request)
  const rl = await checkRateLimit(`auth:forgot:${ip}`, 5, 15 * 60 * 1000)
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

  const parsed = forgotPasswordBodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const email = parsed.data.email.trim().toLowerCase()
  const row = await findUserForAuthByEmail(email)

  // Always return success to avoid email enumeration
  const okResponse = jsonOk({
    ok: true,
    message: "If an account exists for this email, a reset link has been sent.",
  })

  if (!row) {
    log.warn("auth_forgot_no_user", { email })
    return withCors(request, okResponse)
  }

  try {
    const token = await createPasswordResetToken(row.id)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`
    const sent = await sendEmail(
      row.email,
      "Reset your Time to Match password",
      `<p>Hi ${row.name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`
    )
    log.info("auth_forgot_ok", { userId: row.id, emailSent: sent })
  } catch (e) {
    log.error("auth_forgot_err", { err: e instanceof Error ? e.message : String(e) })
  }

  return withCors(request, okResponse)
}
