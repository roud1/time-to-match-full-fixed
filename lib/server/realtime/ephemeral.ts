/**
 * Ephemeral typing + presence store (in-memory; Upstash Redis when configured).
 * Authoritative chat state remains in PostgreSQL — this is fan-out only.
 */

import { Redis } from "@upstash/redis"

const TYPING_TTL_SEC = 4
const PRESENCE_TTL_SEC = 90
const ANALYZING_TTL_SEC = 12
const ONLINE_THRESHOLD_MS = 45_000

type MemoryTyping = Map<string, number>
const memoryTyping = new Map<string, MemoryTyping>()
const memoryPresence = new Map<string, number>()
const memoryAnalyzing = new Map<string, number>()

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

export function isRealtimeRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

function typingKey(matchId: string, userId: string) {
  return `ttm:rt:typing:${matchId}:${userId}`
}

function presenceKey(userId: string) {
  return `ttm:rt:presence:${userId}`
}

function analyzingKey(matchId: string) {
  return `ttm:rt:analyzing:${matchId}`
}

function pruneMemoryTyping(room: MemoryTyping) {
  const now = Date.now()
  for (const [uid, exp] of room) {
    if (exp <= now) room.delete(uid)
  }
}

export async function setUserTyping(matchId: string, userId: string): Promise<void> {
  const redis = getRedis()
  const expiresAt = Date.now() + TYPING_TTL_SEC * 1000

  if (redis) {
    await redis.set(typingKey(matchId, userId), "1", { ex: TYPING_TTL_SEC })
    return
  }

  let room = memoryTyping.get(matchId)
  if (!room) {
    room = new Map()
    memoryTyping.set(matchId, room)
  }
  room.set(userId, expiresAt)
  pruneMemoryTyping(room)
}

export async function clearUserTyping(matchId: string, userId: string): Promise<void> {
  const redis = getRedis()
  if (redis) {
    await redis.del(typingKey(matchId, userId))
    return
  }
  memoryTyping.get(matchId)?.delete(userId)
}

export async function isUserTyping(matchId: string, userId: string): Promise<boolean> {
  const redis = getRedis()
  if (redis) {
    const v = await redis.get(typingKey(matchId, userId))
    return v != null
  }

  const room = memoryTyping.get(matchId)
  if (!room) return false
  const exp = room.get(userId)
  if (!exp) return false
  if (exp <= Date.now()) {
    room.delete(userId)
    return false
  }
  return true
}

export async function heartbeatPresence(userId: string): Promise<void> {
  const redis = getRedis()
  const at = Date.now()

  if (redis) {
    await redis.set(presenceKey(userId), String(at), { ex: PRESENCE_TTL_SEC })
    return
  }

  memoryPresence.set(userId, at)
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const redis = getRedis()
  const now = Date.now()

  if (redis) {
    const raw = await redis.get<string>(presenceKey(userId))
    if (!raw) return false
    const at = Number(raw)
    return Number.isFinite(at) && now - at <= ONLINE_THRESHOLD_MS
  }

  const at = memoryPresence.get(userId)
  if (!at) return false
  if (now - at > ONLINE_THRESHOLD_MS) {
    memoryPresence.delete(userId)
    return false
  }
  return true
}

export async function getOnlineMap(userIds: string[]): Promise<Record<string, boolean>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  const out: Record<string, boolean> = {}
  await Promise.all(
    unique.map(async (id) => {
      out[id] = await isUserOnline(id)
    })
  )
  return out
}

export async function setConnectionAnalyzing(matchId: string): Promise<void> {
  const redis = getRedis()
  const expiresAt = Date.now() + ANALYZING_TTL_SEC * 1000

  if (redis) {
    await redis.set(analyzingKey(matchId), "1", { ex: ANALYZING_TTL_SEC })
    return
  }

  memoryAnalyzing.set(matchId, expiresAt)
}

export async function isConnectionAnalyzing(matchId: string): Promise<boolean> {
  const redis = getRedis()
  if (redis) {
    const v = await redis.get(analyzingKey(matchId))
    return v != null
  }

  const exp = memoryAnalyzing.get(matchId)
  if (!exp) return false
  if (exp <= Date.now()) {
    memoryAnalyzing.delete(matchId)
    return false
  }
  return true
}
