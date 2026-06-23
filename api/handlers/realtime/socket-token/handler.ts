import { NextResponse } from "next/server"
import { getSessionFromRequest } from "@/server/auth/session-request"
import { signSocketToken } from "@/server/auth/jwt"
import { jsonError, jsonOk, withCors } from "@/server/http"

export const runtime = "nodejs"

export async function OPTIONS(request: Request) {
  return withCors(request, new NextResponse(null, { status: 204 }))
}

/** GET /api/realtime/socket-token — short-lived JWT for Socket.io cross-origin auth */
export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return withCors(request, jsonError(401, { error: "unauthenticated", message: "No session" }))
  }

  const token = await signSocketToken(session)
  return withCors(
    request,
    jsonOk({
      token,
      expiresIn: 300,
    })
  )
}
