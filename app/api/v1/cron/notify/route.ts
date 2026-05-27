import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/server/env"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { log } from "@/lib/server/log"
import { runNotificationsCron } from "@/lib/server/notifications/run-cron"

export const runtime = "nodejs"

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  const header = request.headers.get("authorization")
  if (header === `Bearer ${secret}`) return true
  return request.headers.get("x-cron-secret") === secret
}

export async function GET(request: Request) {
  return handleNotify(request)
}

export async function POST(request: Request) {
  return handleNotify(request)
}

async function handleNotify(request: Request) {
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
    const result = await runNotificationsCron()
    return withCors(request, jsonOk({ ok: true, result }))
  } catch (e) {
    log.error("cron_notify_err", { err: e instanceof Error ? e.message : String(e) })
    return withCors(request, jsonError(500, { error: "internal_error", message: "Notification cron failed" }))
  }
}
