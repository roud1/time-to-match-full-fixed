import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { getProfile, updateProfile } from "@/server/profile"

export const runtime = "nodejs"

const patchSchema = z.object({
  bio: z.string().max(2000).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .nullable()
    .optional(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .nullable()
    .optional(),
  interestIds: z.array(z.number().int().positive()).optional(),
  interests: z.array(z.number().int().positive()).optional(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const profile = await getProfile(auth.session.sub)
  if (!profile) {
    return withCors(request, jsonError(404, { error: "not_found", message: "User not found" }))
  }

  return withCors(request, jsonOk({ profile }))
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

  const data = parsed.data
  const profile = await updateProfile(auth.session.sub, {
    bio: data.bio,
    birthDate: data.birthDate ?? data.birth_date,
    interestIds: data.interestIds ?? data.interests,
  })

  if (!profile) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update profile" }))
  }

  return withCors(request, jsonOk({ profile }))
}
