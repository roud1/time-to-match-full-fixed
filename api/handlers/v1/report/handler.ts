import { z } from "zod"
import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { submitUserReport } from "@/server/repositories/moderation"
import { findUserById } from "@/server/repositories/users"

export const runtime = "nodejs"

const bodySchema = z.object({
  reportedUserId: z.string().uuid(),
  reasonKey: z.string().min(1).max(64),
  comment: z.string().max(500).optional().nullable(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/v1/report — submit a user report (production DB only) */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonOk({ ok: true, mode: "demo" as const })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const rl = await checkRateLimit(`report:${session.sub}`, 20, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited", message: "Too many reports" }, { headers: { "Retry-After": String(rl.retryAfterSec) } })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  const target = await findUserById(parsed.data.reportedUserId)
  if (!target) {
    return withCors(request, jsonError(404, { error: "not_found", message: "User not found" }))
  }

  const ok = await submitUserReport({
    reporterId: session.sub,
    reportedUserId: parsed.data.reportedUserId,
    reasonKey: parsed.data.reasonKey,
    comment: parsed.data.comment,
  })

  if (!ok) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not submit report" }))
  }

  return withCors(request, jsonOk({ ok: true }))
}
