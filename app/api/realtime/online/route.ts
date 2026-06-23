import { NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/server/auth/session-request"
import { jsonError, jsonOk, withCors } from "@/lib/server/http"
import { getOnlineMap, heartbeatPresence } from "@/lib/server/realtime/ephemeral"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/realtime/online?ids=uuid,uuid — batch presence for match list */
export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const raw = new URL(request.url).searchParams.get("ids") ?? ""
  const userIds = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40)

  await heartbeatPresence(session.sub)

  const online = userIds.length ? await getOnlineMap(userIds) : {}
  return withCors(request, jsonOk({ online }))
}
