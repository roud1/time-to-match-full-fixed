import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { savePushSubscription } from "@/server/repositories/users"

export const runtime = "nodejs"

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  /** UI language, used for the push texts. */
  locale: z.string().max(10).optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "Auth not configured" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON" }))
  }

  const parsed = subscriptionSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const { locale, ...subscription } = parsed.data
  const ok = await savePushSubscription(session.sub, subscription)
  if (ok && locale) {
    const { savePushLocale } = await import("@/server/push/devices")
    await savePushLocale(session.sub, locale)
  }
  if (!ok) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not save subscription" }))
  }

  return withCors(request, jsonOk({ success: true }))
}
