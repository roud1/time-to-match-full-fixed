import { NextResponse } from "next/server"
import { getServerEnv } from "@/config/env"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/server/http"
import { countUnread, listUnreadInbox } from "@/server/notifications/repository"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

export async function GET(request: Request) {
  const env = getServerEnv()
  if (!env.isAuthConfigured) {
    return withCors(
      request,
      jsonError(503, {
        error: "service_unavailable",
        message: "Configure DATABASE_URL and AUTH_SECRET for notifications.",
      })
    )
  }

  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const [notifications, unreadCount] = await Promise.all([
    listUnreadInbox(session.sub),
    countUnread(session.sub),
  ])

  return withCors(request, jsonOk({ notifications, unreadCount }))
}
