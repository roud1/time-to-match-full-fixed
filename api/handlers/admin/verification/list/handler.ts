import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { isAdminRequestAsync } from "@/server/auth/admin"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { loadPhotoBytes } from "@/server/blind-date/photo"
import { findVerificationSelfie, listPendingVerificationRequests } from "@/server/repositories/verification"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/admin/verification — pending photo verifications (admins only). */
export async function listVerifications(request: Request) {
  if (!getServerEnv().isDatabaseConfigured) {
    return withCors(request, jsonError(503, { error: "no_database", message: "DATABASE_URL not configured" }))
  }
  if (!(await isAdminRequestAsync(request))) {
    return withCors(request, jsonError(403, { error: "forbidden", message: "Admin access required" }))
  }
  const requests = await listPendingVerificationRequests()
  return withCors(request, jsonOk({ requests, count: requests.length }))
}

/** GET /api/admin/verification/:id/selfie — the selfie image (admins only, never cached by others). */
export async function getVerificationSelfie(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const noStore = { "Cache-Control": "private, no-store" }
  if (!(await isAdminRequestAsync(request))) return new Response(null, { status: 403, headers: noStore })
  const { id } = await ctx.params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404, headers: noStore })
  const ref = await findVerificationSelfie(id)
  const bytes = ref ? await loadPhotoBytes(ref) : null
  if (!bytes) return new Response(null, { status: 404, headers: noStore })
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: { ...noStore, "Content-Type": ref!.startsWith("data:image/png") ? "image/png" : "image/jpeg", "X-Content-Type-Options": "nosniff" },
  })
}
