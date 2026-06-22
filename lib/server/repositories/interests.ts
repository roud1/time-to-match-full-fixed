import { getDb } from "@/lib/server/db"
import type { Interest } from "@/lib/interests/types"

export type DbInterestRow = {
  id: number
  name: string
  category: string | null
  emoji: string | null
  slug: string | null
}

function mapRow(row: DbInterestRow): Interest {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    emoji: row.emoji,
    slug: row.slug,
  }
}

export async function listAllInterests(): Promise<Interest[]> {
  const db = getDb()
  if (!db) return []
  const rows = await db<DbInterestRow[]>`
    SELECT id, name, category, emoji, slug
    FROM interests
    ORDER BY name ASC
  `
  return rows.map(mapRow)
}

export async function getInterestIdsByUser(userId: string): Promise<number[]> {
  const db = getDb()
  if (!db) return []
  const rows = await db<{ interest_id: number }[]>`
    SELECT interest_id FROM user_interests WHERE user_id = ${userId}
  `
  return rows.map((r) => r.interest_id)
}

export async function syncUserInterests(userId: string, interestIds: number[]): Promise<void> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")

  const unique = [...new Set(interestIds.filter((id) => Number.isInteger(id) && id > 0))]

  await db`DELETE FROM user_interests WHERE user_id = ${userId}`
  if (unique.length === 0) return

  await db`
    INSERT INTO user_interests ${db(
      unique.map((interest_id) => ({ user_id: userId, interest_id }))
    )}
  `
}

export async function getInterestsForUsers(
  userIds: string[]
): Promise<Map<string, DbInterestRow[]>> {
  const db = getDb()
  const map = new Map<string, DbInterestRow[]>()
  if (!db || userIds.length === 0) return map

  const rows = await db`
    SELECT ui.user_id, i.id, i.name, i.category, i.emoji, i.slug
    FROM user_interests ui
    JOIN interests i ON i.id = ui.interest_id
    WHERE ui.user_id = ANY(${userIds})
  ` as Array<{
    user_id: string
    id: number
    name: string
    category: string | null
    emoji: string | null
    slug: string | null
  }>

  for (const row of rows) {
    const list = map.get(row.user_id) ?? []
    list.push({
      id: row.id,
      name: row.name,
      category: row.category,
      emoji: row.emoji,
      slug: row.slug,
    })
    map.set(row.user_id, list)
  }
  return map
}
