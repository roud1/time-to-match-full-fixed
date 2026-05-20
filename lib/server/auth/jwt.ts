import { SignJWT, jwtVerify } from "jose"
import { getServerEnv } from "@/lib/server/env"

const COOKIE = "ttm_session"
const ALG = "HS256"

function getSecret() {
  const s = getServerEnv().AUTH_SECRET
  if (!s) throw new Error("AUTH_SECRET not configured")
  return new TextEncoder().encode(s)
}

export type SessionClaims = {
  sub: string
  email: string
}

export async function signSessionToken(claims: SessionClaims, expiresIn = "7d") {
  return await new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
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

export const AUTH_COOKIE_NAME = COOKIE

export function authCookieOptions(): {
  httpOnly: true
  sameSite: "lax"
  secure: boolean
  path: string
  maxAge: number
} {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }
}
