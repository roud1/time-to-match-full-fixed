import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { isValidGestureCode } from "@/lib/server/verification/gestures"
import { saveVerificationSelfie } from "@/lib/server/verification/upload"
import {
  createVerificationRequest,
  getUserPhotoVerified,
  hasPendingVerificationRequest,
} from "@/lib/server/repositories/verification"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
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

  if (await getUserPhotoVerified(session.sub)) {
    return withCors(request, jsonError(400, { error: "already_verified", message: "Already verified" }))
  }

  if (await hasPendingVerificationRequest(session.sub)) {
    return withCors(
      request,
      jsonError(409, { error: "pending_exists", message: "Verification already pending" })
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return withCors(request, jsonError(400, { error: "invalid_form", message: "Expected multipart form" }))
  }

  const gesture = String(form.get("gesture") ?? "").trim()
  const selfie = form.get("selfie")

  if (!isValidGestureCode(gesture)) {
    return withCors(request, jsonError(400, { error: "invalid_gesture", message: "Unknown gesture" }))
  }

  if (!(selfie instanceof File) || selfie.size === 0) {
    return withCors(request, jsonError(400, { error: "missing_selfie", message: "Selfie file required" }))
  }

  const saved = await saveVerificationSelfie(session.sub, selfie)
  if ("error" in saved) {
    const message =
      saved.error === "file_too_large"
        ? "File too large (max 5MB)"
        : "Only JPEG, PNG or WebP allowed"
    return withCors(request, jsonError(400, { error: saved.error, message }))
  }

  const row = await createVerificationRequest({
    userId: session.sub,
    gesture,
    selfieUrl: saved.url,
  })

  if (!row) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not save request" }))
  }

  return withCors(
    request,
    jsonOk({
      success: true,
      request: row,
      status: { verified: false, requestStatus: "pending" as const },
    })
  )
}
