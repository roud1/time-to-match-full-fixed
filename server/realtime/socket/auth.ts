import type { Socket } from "socket.io"
import { AUTH_COOKIE_NAME, verifySessionToken, type SessionClaims } from "@/server/auth/jwt"
import type { SocketData } from "@/server/realtime/socket/types"

function parseSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  const prefix = `${AUTH_COOKIE_NAME}=`
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }
  return null
}

function tokenFromHandshake(socket: Socket): string | null {
  const auth = socket.handshake.auth as { token?: unknown } | undefined
  if (typeof auth?.token === "string" && auth.token.trim()) {
    return auth.token.trim()
  }
  return parseSessionCookie(socket.handshake.headers.cookie)
}

export async function authenticateSocket(socket: Socket): Promise<SessionClaims | null> {
  const token = tokenFromHandshake(socket)
  if (!token) return null
  return verifySessionToken(token)
}

export function attachSocketUser(socket: Socket, claims: SessionClaims): void {
  const data = socket.data as SocketData
  data.userId = claims.sub
  data.email = claims.email
  data.matchRooms = data.matchRooms ?? new Set()
}
