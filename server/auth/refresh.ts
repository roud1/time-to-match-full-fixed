import type { NextResponse } from "next/server"
import {
  generateRefreshToken,
  insertRefreshToken,
  consumeRefreshToken,
  revokeRefreshToken,
} from "@/server/repositories/refresh-tokens"
import { signAccessToken, type SessionClaims } from "@/server/auth/jwt"
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "@/server/auth/cookies"
import { findUserById } from "@/server/repositories/users"

export type AuthMeta = { userAgent?: string | null; ip?: string | null }

export async function issueAuthCookies(
  res: NextResponse,
  claims: SessionClaims,
  meta?: AuthMeta
): Promise<void> {
  const accessToken = await signAccessToken(claims)
  const refreshToken = generateRefreshToken()

  await insertRefreshToken({
    userId: claims.sub,
    rawToken: refreshToken,
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  })

  res.cookies.set(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions())
  res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions())
}

export async function rotateAuthSession(
  rawRefreshToken: string,
  meta?: AuthMeta
): Promise<{ claims: SessionClaims } | null> {
  const userId = await consumeRefreshToken(rawRefreshToken)
  if (!userId) return null

  const user = await findUserById(userId)
  if (!user) return null

  const claims: SessionClaims = { sub: user.id, email: user.email }
  return { claims }
}

export async function applyRotatedAuthCookies(
  res: NextResponse,
  claims: SessionClaims,
  meta?: AuthMeta
): Promise<void> {
  await issueAuthCookies(res, claims, meta)
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE_NAME, "", clearCookieOptions(ACCESS_COOKIE_NAME))
  res.cookies.set(REFRESH_COOKIE_NAME, "", clearCookieOptions(REFRESH_COOKIE_NAME))
}

export async function revokeAuthSession(rawRefreshToken: string | undefined): Promise<void> {
  if (!rawRefreshToken) return
  await revokeRefreshToken(rawRefreshToken)
}
