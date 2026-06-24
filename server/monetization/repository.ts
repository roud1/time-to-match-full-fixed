import { getDb } from "@/server/db"

export async function getDailyLikesUsed(userId: string, likeDate: string): Promise<number> {
  const db = getDb()
  if (!db) return 0

  const rows = await db<{ likes_used: number }[]>`
    SELECT likes_used FROM user_daily_likes
    WHERE user_id = ${userId} AND like_date = ${likeDate}::date
    LIMIT 1
  `
  return rows[0]?.likes_used ?? 0
}

export async function incrementDailyLikes(userId: string, likeDate: string): Promise<number> {
  const db = getDb()
  if (!db) return 0

  const rows = await db<{ likes_used: number }[]>`
    INSERT INTO user_daily_likes (user_id, like_date, likes_used)
    VALUES (${userId}, ${likeDate}::date, 1)
    ON CONFLICT (user_id, like_date) DO UPDATE SET
      likes_used = user_daily_likes.likes_used + 1
    RETURNING likes_used
  `
  return rows[0]?.likes_used ?? 1
}

export async function getBoostExpiresAt(userId: string): Promise<Date | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<{ boost_expires_at: Date | null }[]>`
    SELECT boost_expires_at FROM users WHERE id = ${userId} LIMIT 1
  `
  return rows[0]?.boost_expires_at ?? null
}

export async function setBoostExpiresAt(userId: string, expiresAt: Date): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE users SET boost_expires_at = ${expiresAt} WHERE id = ${userId}
  `
}

export async function getActiveBoostUserIds(userIds: string[]): Promise<Set<string>> {
  const db = getDb()
  const active = new Set<string>()
  if (!db || userIds.length === 0) return active

  const rows = await db<{ id: string }[]>`
    SELECT id FROM users
    WHERE id = ANY(${userIds})
      AND boost_expires_at IS NOT NULL
      AND boost_expires_at > now()
  `
  for (const row of rows) active.add(row.id)
  return active
}

export async function getPremiumUntil(userId: string): Promise<Date | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<{ premium_until: Date | null }[]>`
    SELECT premium_until FROM user_subscriptions WHERE user_id = ${userId} LIMIT 1
  `
  return rows[0]?.premium_until ?? null
}
