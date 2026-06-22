export type Bucket = { count: number; resetAt: number }

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number }
