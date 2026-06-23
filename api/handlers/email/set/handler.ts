import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { setUserEmail } from "@/server/repositories/users"

export const runtime = "nodejs"

const bodySchema = z.object({
  email: z.string().email(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable", message: "Auth not configured" }))
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

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const ok = await setUserEmail(session.sub, parsed.data.email)
  if (!ok) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update email" }))
  }

  return withCors(
    request,
    jsonOk({
      success: true,
      email: parsed.data.email.trim(),
      email_verified: true,
    })
  )
}
