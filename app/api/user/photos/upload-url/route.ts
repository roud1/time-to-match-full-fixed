import { NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import { getPhotoStorage } from "@/lib/server/photos/storage"

export const runtime = "nodejs"

const bodySchema = z.object({
  contentType: z
    .string()
    .regex(/^image\/(jpeg|jpg|png|webp|gif|avif)$/i, "Unsupported image type"),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const storage = getPhotoStorage()
  if (!storage.isConfigured()) {
    return withCors(
      request,
      jsonOk({
        configured: false,
        mode: "local" as const,
      })
    )
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

  const presigned = await storage.createPresignedUpload(
    session.sub,
    parsed.data.contentType.toLowerCase()
  )

  if (!presigned) {
    return withCors(
      request,
      jsonError(503, { error: "storage_unavailable", message: "Could not create upload URL" })
    )
  }

  return withCors(
    request,
    jsonOk({
      configured: true,
      mode: "s3" as const,
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      key: presigned.key,
    })
  )
}

export async function GET(request: Request) {
  const storage = getPhotoStorage()
  return withCors(
    request,
    jsonOk({
      configured: storage.isConfigured(),
      mode: storage.isConfigured() ? ("s3" as const) : ("local" as const),
    })
  )
}
