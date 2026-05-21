import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME, verifySessionToken, type SessionClaims } from "@/lib/server/auth/jwt"

export async function getSessionFromRequest(): Promise<SessionClaims | null> {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}
