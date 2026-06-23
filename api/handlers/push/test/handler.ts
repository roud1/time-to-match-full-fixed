import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { findUserById } from "@/server/repositories/users"
import { sendWebPush } from "@/server/push/web-push"
import { isWebPushConfigured } from "@/server/push/web-push"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function POST(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(request, jsonError(503, { error: "service_unavailable", message: "Auth not configured" }))
  }

  if (!isWebPushConfigured()) {
    return withCors(
      request,
      jsonError(503, { error: "service_unavailable", message: "VAPID keys not configured" })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const user = await findUserById(session.sub)
  if (!user?.push_subscription) {
    return withCors(
      request,
      jsonError(400, { error: "no_subscription", message: "Save a push subscription first" })
    )
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const ok = await sendWebPush(user.push_subscription, {
    title: "Time to Match",
    body: "Тестовое push-уведомление — всё работает.",
    url: `${origin.replace(/\/$/, "")}/app`,
    tag: "ttm-test-push",
  })

  if (!ok) {
    return withCors(request, jsonError(500, { error: "send_failed", message: "Push delivery failed" }))
  }

  return withCors(request, jsonOk({ success: true }))
}
