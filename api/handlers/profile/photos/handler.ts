import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/server/http"
import { addPhoto, listPhotos } from "@/server/profile"
import { MAX_USER_PHOTOS } from "@/server/profile/profile.repository"

export const runtime = "nodejs"

const postSchema = z.object({
  url: z.string().min(1).max(4096),
  isPrimary: z.boolean().optional(),
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

  const photos = await listPhotos(auth.session.sub)
  return withCors(request, jsonOk({ photos }))
}

export async function POST(request: Request) {
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

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, jsonFromZodError(parsed.error))
  }

  const photo = await addPhoto(auth.session.sub, parsed.data)
  if (!photo) {
    return withCors(
      request,
      jsonError(400, {
        error: "photo_limit",
        message: `Maximum ${MAX_USER_PHOTOS} photos allowed or invalid URL`,
      })
    )
  }

  return withCors(request, jsonOk({ photo }))
}
