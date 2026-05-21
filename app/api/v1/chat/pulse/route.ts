import { NextResponse } from "next/server"
import { generatePulseReply } from "@/lib/server/pulse-chat-service"
import { jsonError, jsonOk, jsonFromZodError, withCors } from "@/lib/server/http"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"
import { pulseChatBodySchema } from "@/lib/server/validation/pulse-chat"
import { isOpenRouterConfigured } from "@/lib/server/openrouter"

export const runtime = "nodejs"

const RATE_MAX = 40
const RATE_WINDOW_MS = 60 * 60 * 1000

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = checkRateLimit(`pulse-chat:${ip}`, RATE_MAX, RATE_WINDOW_MS)
  if (!limit.ok) {
    return withCors(
      request,
      jsonError(429, {
        error: "rate_limited",
        message: `Too many messages. Retry in ${limit.retryAfterSec}s.`,
      })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json" }))
  }

  const preview = pulseChatBodySchema.safeParse(body)
  if (!preview.success) {
    return withCors(request, jsonFromZodError(preview.error))
  }

  try {
    const { reply, source, configured, billingBlocked } = await generatePulseReply(body)
    return withCors(
      request,
      jsonOk({
        reply,
        source,
        configured: configured ?? isOpenRouterConfigured(),
        provider: isOpenRouterConfigured() ? "openrouter" : "local",
        billingBlocked: billingBlocked ?? false,
      })
    )
  } catch (e) {
    if (e instanceof Error && e.message === "validation_error") {
      return withCors(request, jsonError(400, { error: "validation_error" }))
    }
    return withCors(request, jsonError(500, { error: "pulse_unavailable" }))
  }
}
