import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerEnv } from "@/lib/server/env"
import { isAdminRequest, adminNotConfigured } from "@/lib/server/auth/admin"
import { jsonError, jsonFromZodError, jsonOk, withCors } from "@/lib/server/http"
import {
  findVerificationRequestById,
  reviewVerificationRequest,
} from "@/lib/server/repositories/verification"

export const runtime = "nodejs"

const bodySchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminNotes: z.string().max(2000).optional().nullable(),
})

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  if (adminNotConfigured()) {
    return withCors(
      request,
      jsonError(503, { error: "admin_not_configured", message: "ADMIN_API_KEY not set" })
    )
  }

  if (!isAdminRequest(request)) {
    return withCors(request, jsonError(403, { error: "forbidden", message: "Admin access required" }))
  }

  const { id } = await context.params
  const existing = await findVerificationRequestById(id)
  if (!existing) {
    return withCors(request, jsonError(404, { error: "not_found", message: "Request not found" }))
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

  const updated = await reviewVerificationRequest({
    id,
    status: parsed.data.status,
    adminNotes: parsed.data.adminNotes,
  })

  if (!updated) {
    return withCors(request, jsonError(500, { error: "internal_error", message: "Could not update" }))
  }

  return withCors(request, jsonOk({ success: true, request: updated }))
}
