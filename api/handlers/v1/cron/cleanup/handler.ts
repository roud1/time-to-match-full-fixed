import { NextResponse } from "next/server"
import { authorizeCron } from "@/server/cron-auth"
import { getServerEnv } from "@/config/env"
import { runDbCleanup } from "@/server/db-cleanup"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { log } from "@/server/log"

export const runtime = "nodejs"

export async function GET(request: Request) {
  return handleCleanup(request)
}

export async function POST(request: Request) {
  return handleCleanup(request)
}

async function handleCleanup(request: Request) {
  const env = getServerEnv()
  if (!env.isDatabaseConfigured) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "DATABASE_URL not configured" })
    )
  }

  if (!authorizeCron(request)) {
    return withCors(request, jsonError(401, { error: "unauthorized", message: "Invalid cron secret" }))
  }

  try {
    const result = await runDbCleanup()
    return withCors(request, jsonOk({ ok: true, result }))
  } catch (e) {
    log.error("cron_cleanup_err", { err: e instanceof Error ? e.message : String(e) })
    return withCors(request, jsonError(500, { error: "internal_error", message: "DB cleanup cron failed" }))
  }
}
