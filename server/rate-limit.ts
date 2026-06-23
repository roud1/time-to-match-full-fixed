import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { RateLimitResult } from "@/server/rate-limit-types"
import { checkRateLimitInMemory } from "@/server/rate-limit-memory"

let redisClient: Redis | null = null
const limiterCache = new Map<string, Ratelimit>()

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  const redis = getRedis()
  if (!redis) return null

  const cacheKey = `${max}:${windowMs}`
  let limiter = limiterCache.get(cacheKey)
  if (!limiter) {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSec} s`),
      prefix: "ttm:rl",
      analytics: false,
    })
    limiterCache.set(cacheKey, limiter)
  }
  return limiter
}

export function isRedisRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/** Rate limit — Upstash Redis when configured, otherwise in-memory. */
export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<RateLimitResult> {
  const limiter = getLimiter(max, windowMs)
  if (!limiter) return checkRateLimitInMemory(key, max, windowMs)

  const result = await limiter.limit(key)
  if (result.success) return { ok: true }
  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return { ok: false, retryAfterSec }
}

export { getClientIp } from "@/server/rate-limit-memory"
