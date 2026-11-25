import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { checkRateLimit } from "@/server/rate-limit"
import { registerPushDevice, unregisterPushDevice } from "@/server/push/devices"

export const runtime = "nodejs"

const schema = z.object({
  token: z.string().min(20).max(4096),
  platform: z.enum(["android", "ios"]).default("android"),
  locale: z.string().max(10).optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

async function body(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/** POST /api/push/device — register the Android app's Firebase token for instant notifications. */
export async function POST(request: Request) {
  if (!getServerEnv().isDatabaseConfigured) return withCors(request, jsonError(503, { error: "service_unavailable" }))
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const rl = await checkRateLimit(`push-device:${auth.session.sub}`, 20, 60 * 60_000)
  if (!rl.ok) return withCors(request, jsonError(429, { error: "rate_limited" }))
  const parsed = schema.safeParse(await body(request))
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))
  await registerPushDevice({ userId: auth.session.sub, ...parsed.data })
  return withCors(request, jsonOk({ ok: true }))
}

/** DELETE /api/push/device — stop notifications on this device (e.g. on sign-out). */
export async function DELETE(request: Request) {
  if (!getServerEnv().isDatabaseConfigured) return withCors(request, jsonError(503, { error: "service_unavailable" }))
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const parsed = schema.pick({ token: true }).safeParse(await body(request))
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))
  await unregisterPushDevice(auth.session.sub, parsed.data.token)
  return withCors(request, jsonOk({ ok: true }))
}
