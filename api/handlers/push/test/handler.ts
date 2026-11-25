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
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  const payload = {
    title: "Luvia",
    body: "Тестовое push-уведомление — всё работает.",
    url: "/app",
    tag: "ttm-test-push",
  }

  // Android app (Firebase) and browser / iPhone home-screen app (web push).
  const { sendFcmToUser } = await import("@/server/push/fcm")
  const native = await sendFcmToUser(session.sub, payload)
  const web = user?.push_subscription
    ? await sendWebPush(user.push_subscription, { ...payload, url: `${origin.replace(/\/$/, "")}/app` })
    : false

  if (!web && native === 0) {
    return withCors(
      request,
      jsonError(user?.push_subscription ? 500 : 400, {
        error: user?.push_subscription ? "send_failed" : "no_subscription",
        message: "No notification was delivered",
      })
    )
  }

  return withCors(request, jsonOk({ success: true }))
}
