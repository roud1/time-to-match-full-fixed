/**
 * Fixed-window in-memory rate limiter.
 * For multi-instance production, replace with Redis / Upstash / edge shared store.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function checkRateLimit(key: string, max: number, windowMs: number): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  let b = buckets.get(key)
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs }
    buckets.set(key, b)
  }
  if (b.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) }
  }
  b.count += 1
  return { ok: true }
}

export function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for")
  if (fwd) {
    const first = fwd.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip") || "unknown"
}
