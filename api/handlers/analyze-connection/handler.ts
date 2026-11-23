import { NextResponse } from "next/server"
import { analyzeConnectionOnServer } from "@/server/connection-ai-service"
import { jsonError, jsonOk, jsonFromZodError, withCors } from "@/server/http"
import { checkRateLimit, getClientIp } from "@/server/rate-limit"
import { analyzeConnectionBodySchema } from "@/server/validation/connection-ai"
import { isOpenRouterConfigured } from "@/server/openrouter"

export const runtime = "nodejs"

const RATE_MAX = 30
const RATE_WINDOW_MS = 60 * 60 * 1000

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = await checkRateLimit(`analyze-connection:${ip}`, RATE_MAX, RATE_WINDOW_MS)
  if (!limit.ok) {
    return withCors(
      request,
      jsonError(429, {
        error: "rate_limited",
        message: `Too many analyses. Retry in ${limit.retryAfterSec}s.`,
      })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON body" }))
  }

  const preview = analyzeConnectionBodySchema.safeParse(body)
  if (!preview.success) {
    return withCors(request, jsonFromZodError(preview.error))
  }

  // Anonymous endpoint without a verifiable match: never sends the transcript to the AI provider
  // (it contains the other person's messages and anyone could relay text through our key).
  const result = await analyzeConnectionOnServer(body, { externalAi: false })
  if (!result.ok) {
    return withCors(request, jsonError(400, { error: result.error, message: "Invalid request" }))
  }

  return withCors(
    request,
    jsonOk({
      ...result.data,
      configured: isOpenRouterConfigured(),
      provider: "local",
    })
  )
}
