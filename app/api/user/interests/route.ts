import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { syncUserInterests } from "@/lib/server/repositories/interests"

export const runtime = "nodejs"

const bodySchema = z
  .object({
    interestIds: z.array(z.number().int().positive()).optional(),
    interests: z.array(z.number().int().positive()).optional(),
  })
  .transform((data) => ({
    interestIds: data.interestIds ?? data.interests ?? [],
  }))

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function PUT(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
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

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  try {
    await syncUserInterests(session.sub, parsed.data.interestIds)
  } catch {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not save interests" }))
  }

  return withCors(request, jsonOk({ success: true, interestIds: parsed.data.interestIds }))
}
