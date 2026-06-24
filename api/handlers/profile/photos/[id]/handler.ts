import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { removePhoto } from "@/server/profile"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function DELETE(request: Request, context: RouteContext) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const { id } = await context.params
  if (!id?.trim()) {
    return withCors(request, jsonError(400, { error: "invalid_id", message: "Photo id required" }))
  }

  const ok = await removePhoto(auth.session.sub, id)
  if (!ok) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Photo not found" }))
  }

  return withCors(request, jsonOk({ success: true }))
}
