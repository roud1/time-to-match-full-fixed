import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { findUserById } from "@/server/repositories/users"
import { updateUserDiscoveryFields } from "@/server/repositories/discover"
import { DATING_PURPOSES } from "@/client/lib/interests/types"

export const runtime = "nodejs"

const bodySchema = z.object({
  purpose: z.enum(DATING_PURPOSES).optional(),
  gender: z.enum(["male", "female"]).nullable().optional(),
  ageMin: z.number().int().min(18).max(99).nullable().optional(),
  ageMax: z.number().int().min(18).max(99).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  maxDistance: z.number().int().min(1).max(500).optional(),
  profile: z.record(z.unknown()).optional(),
}).refine((v) => {
  if (v.ageMin == null || v.ageMax == null) return true
  return v.ageMin <= v.ageMax
}, { message: "ageMin must be <= ageMax", path: ["ageMin"] })

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
    gender: data.gender,
    ageMin: data.ageMin,
    ageMax: data.ageMax,
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
      gender: data.gender !== undefined ? data.gender : user.gender,
      ageMin: data.ageMin !== undefined ? data.ageMin : user.age_min,
      ageMax: data.ageMax !== undefined ? data.ageMax : user.age_max,
      latitude: data.latitude !== undefined ? data.latitude : user.latitude,
      longitude: data.longitude !== undefined ? data.longitude : user.longitude,
      maxDistance: data.maxDistance ?? user.max_distance,
    })
  )
}
