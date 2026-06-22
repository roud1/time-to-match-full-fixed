import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/server/auth/password"
import { getServerEnv } from "@/lib/server/env"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"
import {
  consumePasswordResetToken,
  updateUserPassword,
} from "@/lib/server/repositories/password-reset"
import { resetPasswordBodySchema } from "@/lib/server/validation/auth"

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
  const rl = await checkRateLimit(`auth:reset:${ip}`, 10, 15 * 60 * 1000)
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

  const parsed = resetPasswordBodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const userId = await consumePasswordResetToken(parsed.data.token)
  if (!userId) {
    return withCors(
      request,
      jsonError(400, { error: "invalid_token", message: "Reset link is invalid or expired." })
    )
  }

  const passwordHash = await hashPassword(parsed.data.password)
  const updated = await updateUserPassword(userId, passwordHash)
  if (!updated) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update password." }))
  }

  log.info("auth_reset_ok", { userId })
  return withCors(request, jsonOk({ ok: true, message: "Password updated. You can sign in now." }))
}
