/** HttpOnly cookie names and options for access + refresh tokens. */

export const ACCESS_COOKIE_NAME = "ttm_session"
export const REFRESH_COOKIE_NAME = "ttm_refresh"

export const ACCESS_MAX_AGE_SEC = 15 * 60
export const REFRESH_MAX_AGE_SEC = 60 * 60 * 24 * 7

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1"
}

type CookieOpts = {
  httpOnly: true
  sameSite: "lax"
  secure: boolean
  path: string
  maxAge: number
}

export function accessCookieOptions(): CookieOpts {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: ACCESS_MAX_AGE_SEC,
  }
}

export function refreshCookieOptions(): CookieOpts {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookie(),
    path: "/",
    maxAge: REFRESH_MAX_AGE_SEC,
  }
}

export function clearCookieOptions(name: string): CookieOpts & { name: string } {
  const base = name === REFRESH_COOKIE_NAME ? refreshCookieOptions() : accessCookieOptions()
  return { ...base, name, maxAge: 0 }
}

/** @deprecated Use ACCESS_COOKIE_NAME — kept for gradual migration. */
export const AUTH_COOKIE_NAME = ACCESS_COOKIE_NAME

/** @deprecated Use accessCookieOptions */
export function authCookieOptions(): CookieOpts {
  return accessCookieOptions()
}
