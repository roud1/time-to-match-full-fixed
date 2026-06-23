import { SignJWT, jwtVerify } from "jose"

export const ADMIN_SESSION_COOKIE = "ttm_admin_session"
const ALG = "HS256"
const TTL = "8h"

function getAdminSecret(): Uint8Array {
  const key = process.env.ADMIN_API_KEY
  if (!key || key.length < 8) {
    throw new Error("ADMIN_API_KEY not configured")
  }
  return new TextEncoder().encode(key)
}

export async function signAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(getAdminSecret())
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret(), { algorithms: [ALG] })
    return payload.role === "admin"
  } catch {
    return false
  }
}

export function adminSessionCookieOptions(): {
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
    maxAge: 60 * 60 * 8,
  }
}
