import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { requireAuth } from "@/server/auth/require-auth"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { syncProfileActivity } from "@/server/profile-life/service"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** POST /api/profile/activity — extend profile life + last_active_at */
export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(request, jsonOk({ synced: false, demo: true }))
  }

  const auth = await requireAuth(request)
  if (!auth.ok) return withCors(request, auth.response)

  const result = await syncProfileActivity(auth.session.sub)
  if (!result) {
    return withCors(request, jsonError(404, { error: "not_found", message: "User not found" }))
  }

  return withCors(request, jsonOk({ synced: true, ...result }))
}
