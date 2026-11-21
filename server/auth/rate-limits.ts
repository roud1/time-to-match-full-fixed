/**
 * Multiplies every auth rate limit. Defaults to 1 (production values below).
 * CI sets AUTH_RATE_LIMIT_MULTIPLIER so the e2e suite (one IP, ~15 sign-ups) is not throttled.
 */
function rateLimitMultiplier(): number {
  const n = Number(process.env.AUTH_RATE_LIMIT_MULTIPLIER)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

const WINDOW_MS = 15 * 60 * 1000
const m = rateLimitMultiplier()

/** Preset rate limits for authentication endpoints. */
export const AUTH_RATE_LIMITS = {
  login: { max: 20 * m, windowMs: WINDOW_MS },
  register: { max: 8 * m, windowMs: WINDOW_MS },
  refresh: { max: 30 * m, windowMs: WINDOW_MS },
  forgotPassword: { max: 5 * m, windowMs: WINDOW_MS },
  resetPassword: { max: 10 * m, windowMs: WINDOW_MS },
} as const
