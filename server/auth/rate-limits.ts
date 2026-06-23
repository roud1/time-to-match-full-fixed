/** Preset rate limits for authentication endpoints. */
export const AUTH_RATE_LIMITS = {
  login: { max: 20, windowMs: 15 * 60 * 1000 },
  register: { max: 8, windowMs: 15 * 60 * 1000 },
  refresh: { max: 30, windowMs: 15 * 60 * 1000 },
  forgotPassword: { max: 5, windowMs: 15 * 60 * 1000 },
  resetPassword: { max: 10, windowMs: 15 * 60 * 1000 },
} as const
