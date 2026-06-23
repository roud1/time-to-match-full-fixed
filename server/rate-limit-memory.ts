import type { Bucket } from "@/server/rate-limit-types"

/**
 * Fixed-window in-memory rate limiter (dev / single-instance fallback).
 * For multi-instance production, set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 */
const buckets = new Map<string, Bucket>()

export function checkRateLimitInMemory(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
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
