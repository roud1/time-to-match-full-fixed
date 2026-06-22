import { z } from "zod"
import { NextResponse } from "next/server"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit"

export const runtime = "nodejs"

const bodySchema = z.object({
  event: z.string().min(1).max(80).regex(/^[a-z0-9_:.-]+$/i),
  properties: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional()
    .refine((p) => !p || Object.keys(p).length <= 24, { message: "Too many properties" }),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`analytics:${ip}`, 120, 60_000)
  if (!rl.ok) {
    return withCors(
      request,
      jsonError(429, { error: "rate_limited" }, { headers: { "Retry-After": String(rl.retryAfterSec) } })
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json" }))
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return withCors(request, jsonFromZodError(parsed.error))

  log.info("client_analytics", {
    event: parsed.data.event,
    properties: parsed.data.properties ?? {},
    ip: process.env.NODE_ENV === "production" ? undefined : ip,
  })

  return withCors(request, jsonOk({ ok: true }))
}
