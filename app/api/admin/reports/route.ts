import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { isAdminRequest, adminNotConfigured } from "@/lib/server/auth/admin"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { listPendingReports } from "@/lib/server/repositories/moderation"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/admin/reports — pending moderation queue (ADMIN_API_KEY) */
export async function GET(request: Request) {
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

  const reports = await listPendingReports()
  return withCors(
    request,
    jsonOk({
      reports: reports.map((r) => ({
        id: r.id,
        reporterId: r.reporterId,
        reportedUserId: r.reportedUserId,
        reason: r.reason,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reporterName: r.reporterName,
        reportedName: r.reportedName,
      })),
      count: reports.length,
    })
  )
}
