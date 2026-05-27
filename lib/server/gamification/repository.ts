import { getDb } from "@/lib/server/db"
import { addFreezeBalance } from "@/lib/server/repositories/users"
import { levelFromXp, xpProgressInLevel } from "@/lib/server/gamification/xp"
import type {
  AchievementListItem,
  DbAchievementRow,
  DbUserXpRow,
  UnlockedAchievementDto,
} from "@/lib/server/gamification/types"

export async function ensureUserXp(userId: string): Promise<DbUserXpRow> {
  const db = getDb()
  if (!db) throw new Error("database_unavailable")
  const rows = await db<DbUserXpRow[]>`
    INSERT INTO user_xp (user_id, xp, level)
    VALUES (${userId}, 0, 1)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id, xp, level, updated_at
  `
  if (rows[0]) return rows[0]
  const existing = await db<DbUserXpRow[]>`
    SELECT user_id, xp, level, updated_at FROM user_xp WHERE user_id = ${userId} LIMIT 1
  `
  return existing[0]!
}

export async function getUserXp(userId: string): Promise<DbUserXpRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbUserXpRow[]>`
    SELECT user_id, xp, level, updated_at FROM user_xp WHERE user_id = ${userId} LIMIT 1
  `
  return rows[0] ?? null
}

export async function addXP(
  userId: string,
  amount: number
): Promise<{ xp: number; level: number; leveledUp: boolean; previousLevel: number }> {
  if (amount <= 0) {
    const row = await ensureUserXp(userId)
    return { xp: row.xp, level: row.level, leveledUp: false, previousLevel: row.level }
  }

  const db = getDb()
  if (!db) throw new Error("database_unavailable")
  await ensureUserXp(userId)

  const before = await getUserXp(userId)
  const previousLevel = before?.level ?? 1

  const rows = await db<DbUserXpRow[]>`
    UPDATE user_xp
    SET xp = xp + ${amount}, updated_at = now()
    WHERE user_id = ${userId}
    RETURNING user_id, xp, level, updated_at
  `
  const row = rows[0]
  if (!row) throw new Error("user_xp_update_failed")

  const newLevel = levelFromXp(row.xp)
  const leveledUp = newLevel > previousLevel

  if (newLevel !== row.level) {
    const updated = await db<DbUserXpRow[]>`
      UPDATE user_xp SET level = ${newLevel}, updated_at = now()
      WHERE user_id = ${userId}
      RETURNING user_id, xp, level, updated_at
    `
    return {
      xp: updated[0]!.xp,
      level: updated[0]!.level,
      leveledUp,
      previousLevel,
    }
  }

  return { xp: row.xp, level: row.level, leveledUp, previousLevel }
}

export async function listAllAchievements(): Promise<DbAchievementRow[]> {
  const db = getDb()
  if (!db) return []
  return db<DbAchievementRow[]>`
    SELECT id, key, title, description, icon, category, xp_reward, freeze_reward, created_at
    FROM achievements
    ORDER BY id ASC
  `
}

export async function getAchievementByKey(key: string): Promise<DbAchievementRow | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<DbAchievementRow[]>`
    SELECT id, key, title, description, icon, category, xp_reward, freeze_reward, created_at
    FROM achievements WHERE key = ${key} LIMIT 1
  `
  return rows[0] ?? null
}

export async function hasUserAchievement(userId: string, achievementKey: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db<{ ok: number }[]>`
    SELECT 1 AS ok
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = ${userId} AND a.key = ${achievementKey}
    LIMIT 1
  `
  return rows.length > 0
}

export async function countUserAchievements(userId: string, excludeKey?: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  if (excludeKey) {
    const rows = await db<{ c: number }[]>`
      SELECT COUNT(*)::int AS c
      FROM user_achievements ua
      JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = ${userId} AND a.key <> ${excludeKey}
    `
    return rows[0]?.c ?? 0
  }
  const rows = await db<{ c: number }[]>`
    SELECT COUNT(*)::int AS c FROM user_achievements WHERE user_id = ${userId}
  `
  return rows[0]?.c ?? 0
}

export async function grantAchievement(
  userId: string,
  achievementKey: string
): Promise<UnlockedAchievementDto | null> {
  const db = getDb()
  if (!db) return null

  const achievement = await getAchievementByKey(achievementKey)
  if (!achievement) return null

  const inserted = await db<{ unlocked_at: Date }[]>`
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (${userId}, ${achievement.id})
    ON CONFLICT (user_id, achievement_id) DO NOTHING
    RETURNING unlocked_at
  `
  if (!inserted[0]) return null

  await addXP(userId, achievement.xp_reward)
  if (achievement.freeze_reward > 0) {
    await addFreezeBalance(userId, achievement.freeze_reward)
  }

  await insertAchievementNotification(userId, achievement)

  return {
    key: achievement.key,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    xpReward: achievement.xp_reward,
    freezeReward: achievement.freeze_reward,
    unlockedAt: inserted[0].unlocked_at.toISOString(),
  }
}

async function insertAchievementNotification(userId: string, achievement: DbAchievementRow) {
  const db = getDb()
  if (!db) return
  try {
    await db`
      INSERT INTO notifications (user_id, type, reference_id, lead_hours, scheduled_for, sent, sent_at)
      VALUES (${userId}, 'achievement_unlocked', NULL, 1, now(), true, now())
    `
  } catch {
    /* optional inbox row */
  }
  void achievement
}

export async function getTotalMessagesForUser(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ total: number }[]>`
    SELECT COALESCE(SUM(ms.total_messages), 0)::int AS total
    FROM match_stats ms
    JOIN likes l ON l.id = ms.match_id
    WHERE l.from_user = ${userId} AND l.is_match = true
  `
  return rows[0]?.total ?? 0
}

export async function getTotalProlongCountForUser(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ total: number }[]>`
    SELECT COALESCE(SUM(ms.prolong_count), 0)::int AS total
    FROM match_stats ms
    JOIN likes l ON l.id = ms.match_id
    WHERE l.from_user = ${userId} AND l.is_match = true
  `
  return rows[0]?.total ?? 0
}

export async function countActiveMatches(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ c: number }[]>`
    SELECT COUNT(*)::int AS c
    FROM likes
    WHERE from_user = ${userId}
      AND is_match = true
      AND is_expired = false
      AND expires_at IS NOT NULL
      AND expires_at > now()
  `
  return rows[0]?.c ?? 0
}

export async function listUserUnlockedAchievements(userId: string): Promise<UnlockedAchievementDto[]> {
  const db = getDb()
  if (!db) return []
  const rows = await db<
    (DbAchievementRow & { unlocked_at: Date })[]
  >`
    SELECT a.id, a.key, a.title, a.description, a.icon, a.category, a.xp_reward, a.freeze_reward, a.created_at, ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = ${userId}
    ORDER BY ua.unlocked_at DESC
  `
  return rows.map((r) => ({
    key: r.key,
    title: r.title,
    description: r.description,
    icon: r.icon,
    xpReward: r.xp_reward,
    freezeReward: r.freeze_reward,
    unlockedAt: r.unlocked_at.toISOString(),
  }))
}

export async function buildAchievementList(userId: string): Promise<AchievementListItem[]> {
  const all = await listAllAchievements()
  const db = getDb()
  if (!db) return []

  const unlockedRows = await db<{ key: string; unlocked_at: Date }[]>`
    SELECT a.key, ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = ${userId}
  `
  const unlockedMap = new Map(unlockedRows.map((r) => [r.key, r.unlocked_at.toISOString()]))
  const unlockedKeys = new Set(unlockedMap.keys())

  const totalMessages = await getTotalMessagesForUser(userId)
  const totalProlongs = await getTotalProlongCountForUser(userId)
  const activeMatches = await countActiveMatches(userId)
  const unlockedCount = unlockedRows.length

  return all.map((a) => {
    const unlocked = unlockedMap.has(a.key)
    const { current, target } = progressForKey(a.key, {
      totalMessages,
      totalProlongs,
      activeMatches,
      unlockedCount,
      hasMatch: unlockedKeys.has("first_match") || activeMatches > 0,
      unlockedKeys,
    })
    return {
      key: a.key,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      xpReward: a.xp_reward,
      freezeReward: a.freeze_reward,
      unlocked,
      unlockedAt: unlockedMap.get(a.key) ?? null,
      progressCurrent: unlocked ? target : current,
      progressTarget: target,
    }
  })
}

function progressForKey(
  key: string,
  stats: {
    totalMessages: number
    totalProlongs: number
    activeMatches: number
    unlockedCount: number
    hasMatch: boolean
    unlockedKeys: Set<string>
  }
): { current: number; target: number } {
  switch (key) {
    case "first_match":
      return { current: stats.hasMatch ? 1 : 0, target: 1 }
    case "first_message":
      return { current: Math.min(stats.totalMessages, 1), target: 1 }
    case "chatterbox":
      return { current: Math.min(stats.totalMessages, 100), target: 100 }
    case "bond_builder":
      return { current: Math.min(stats.totalProlongs, 3), target: 3 }
    case "time_keeper":
      return { current: stats.unlockedKeys.has("time_keeper") ? 1 : 0, target: 1 }
    case "social_butterfly":
      return { current: Math.min(stats.activeMatches, 5), target: 5 }
    case "night_owl":
      return { current: stats.unlockedKeys.has("night_owl") ? 1 : 0, target: 1 }
    case "early_bird":
      return { current: stats.unlockedKeys.has("early_bird") ? 1 : 0, target: 1 }
    case "collector":
      return { current: Math.min(stats.unlockedCount, 5), target: 5 }
    default:
      return { current: 0, target: 1 }
  }
}

export function snapshotFromXp(
  xp: number,
  level: number,
  leveledUp: boolean,
  unlocked: UnlockedAchievementDto[]
) {
  const prog = xpProgressInLevel(xp)
  return {
    xp: prog.xp,
    level,
    xpInLevel: prog.xpInLevel,
    xpForNextLevel: prog.xpForNextLevel,
    progress: prog.progress,
    leveledUp,
    unlocked,
  }
}
