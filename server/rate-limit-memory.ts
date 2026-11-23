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

/**
 * Headers set by the edge proxy that a client cannot forge (the proxy overwrites them).
 * Render sits behind Cloudflare, which sets CF-Connecting-IP / True-Client-IP. Elsewhere they are
 * trusted only when TRUST_CLOUDFLARE_IP_HEADERS=1, because without Cloudflare a client could send them.
 */
const CLOUDFLARE_IP_HEADERS = ["cf-connecting-ip", "true-client-ip"] as const

function trustsCloudflareHeaders(): boolean {
  return process.env.RENDER === "true" || process.env.TRUST_CLOUDFLARE_IP_HEADERS === "1"
}

/**
 * Client IP for rate limiting.
 *
 * X-Forwarded-For alone is not trustworthy: the client can send its own value, and proxies such as
 * Render's only append to it, so its first entry is attacker-controlled (rate limits could be
 * bypassed by changing it on every request). Order:
 *  1. CLIENT_IP_HEADER (explicit override, e.g. "fly-client-ip"),
 *  2. Cloudflare headers when running behind Cloudflare (Render),
 *  3. the first X-Forwarded-For entry, then X-Real-IP (previous behaviour, for local/other hosts).
 */
export function getClientIp(request: Request): string {
  const custom = process.env.CLIENT_IP_HEADER?.trim().toLowerCase()
  if (custom) {
    const v = request.headers.get(custom)?.split(",")[0]?.trim()
    if (v) return v
  }

  if (trustsCloudflareHeaders()) {
    for (const h of CLOUDFLARE_IP_HEADERS) {
      const v = request.headers.get(h)?.trim()
      if (v) return v
    }
  }

  const fwd = request.headers.get("x-forwarded-for")
  if (fwd) {
    const first = fwd.split(",")[0]?.trim()
    if (first) return first
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}
