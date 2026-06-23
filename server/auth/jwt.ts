import { SignJWT, jwtVerify } from "jose"
import { getServerEnv } from "@/config/env"
import { ACCESS_COOKIE_NAME, accessCookieOptions, AUTH_COOKIE_NAME, authCookieOptions } from "@/server/auth/cookies"

const ALG = "HS256"
const ACCESS_TTL = "15m"
const SOCKET_TTL = "5m"

function getSecret() {
  const s = getServerEnv().AUTH_SECRET
  if (!s) throw new Error("AUTH_SECRET not configured")
  return new TextEncoder().encode(s)
}

export type SessionClaims = {
  sub: string
  email: string
}

export async function signAccessToken(claims: SessionClaims) {
  return await new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(getSecret())
}

/** @deprecated Use signAccessToken */
export async function signSessionToken(claims: SessionClaims, expiresIn = ACCESS_TTL) {
  return await new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

/** Short-lived token for cross-origin Socket.io handshake auth. */
export async function signSocketToken(claims: SessionClaims) {
  return signSessionToken(claims, SOCKET_TTL)
}

export async function verifyAccessToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] })
    const sub = typeof payload.sub === "string" ? payload.sub : null
    const email = typeof payload.email === "string" ? payload.email : null
    if (!sub || !email) return null
    return { sub, email }
  } catch {
    return null
  }
}

/** @deprecated Use verifyAccessToken */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  return verifyAccessToken(token)
}

export { ACCESS_COOKIE_NAME, AUTH_COOKIE_NAME, accessCookieOptions, authCookieOptions }
