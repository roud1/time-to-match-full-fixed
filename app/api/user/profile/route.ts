import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { findUserById } from "@/lib/server/repositories/users"
import { updateUserDiscoveryFields } from "@/lib/server/repositories/discover"
import { DATING_PURPOSES } from "@/lib/interests/types"

export const runtime = "nodejs"

const bodySchema = z.object({
  purpose: z.enum(DATING_PURPOSES).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  maxDistance: z.number().int().min(1).max(500).optional(),
  profile: z.record(z.unknown()).optional(),
})

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

  const user = await findUserById(session.sub)
  if (!user) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "User not found" }))
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

  const data = parsed.data
  const mergedProfile =
    data.profile !== undefined
      ? { ...(user.profile ?? {}), ...data.profile }
      : undefined

  const ok = await updateUserDiscoveryFields(session.sub, {
    purpose: data.purpose,
    latitude: data.latitude,
    longitude: data.longitude,
    maxDistance: data.maxDistance,
    profile: mergedProfile,
  })

  if (!ok) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update profile" }))
  }

  return withCors(
    request,
    jsonOk({
      success: true,
      purpose: data.purpose ?? user.purpose,
      latitude: data.latitude !== undefined ? data.latitude : user.latitude,
      longitude: data.longitude !== undefined ? data.longitude : user.longitude,
      maxDistance: data.maxDistance ?? user.max_distance,
    })
  )
}
