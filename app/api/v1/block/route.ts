import { z } from "zod"
import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit } from "@/lib/server/rate-limit"
import { blockUserPair, unblockUserPair } from "@/lib/server/repositories/moderation"
import { findUserById } from "@/lib/server/repositories/users"

export const runtime = "nodejs"

const bodySchema = z.object({
  blockedUserId: z.string().uuid(),
  action: z.enum(["block", "unblock"]),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/v1/block — block or unblock a user */
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

  const rl = await checkRateLimit(`block:${session.sub}`, 30, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited", message: "Too many block requests" }, { headers: { "Retry-After": String(rl.retryAfterSec) } })
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

  const target = await findUserById(parsed.data.blockedUserId)
  if (!target) {
    return withCors(request, jsonError(404, { error: "not_found", message: "User not found" }))
  }

  const ok =
    parsed.data.action === "block"
      ? await blockUserPair(session.sub, parsed.data.blockedUserId)
      : await unblockUserPair(session.sub, parsed.data.blockedUserId)

  if (!ok) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update block" }))
  }

  return withCors(request, jsonOk({ ok: true, action: parsed.data.action }))
}
