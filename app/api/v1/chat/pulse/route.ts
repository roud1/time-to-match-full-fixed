import { NextResponse } from "next/server"
import { z } from "zod"
import type { Locale } from "@/lib/i18n"
import { generatePulseReply } from "@/lib/server/pulse-ai"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"

export const runtime = "nodejs"

const bodySchema = z.object({
  locale: z.enum(["ru", "uk", "en"]).default("ru"),
  userName: z.string().min(1).max(64).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`pulse-chat:${ip}`, 40, 60 * 60 * 1000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited", message: "Too many messages" }, { headers: { "Retry-After": String(rl.retryAfterSec) } })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const { locale, messages, userName } = parsed.data
  const { text, source } = await generatePulseReply(locale as Locale, messages, userName)

  return withCors(request, jsonOk({ reply: text, source }))
}
