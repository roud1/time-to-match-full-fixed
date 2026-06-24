import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { setLocation } from "@/server/profile"

export const runtime = "nodejs"

const patchSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  city: z.string().max(200).nullable().optional(),
  country: z.string().max(200).nullable().optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function PATCH(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_json", message: "Expected JSON" }))
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const profile = await setLocation(auth.session.sub, parsed.data)
  if (!profile) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update location" }))
  }

  return withCors(request, jsonOk({ location: profile.location, profile }))
}
