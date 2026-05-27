import type { AchievementCheckContext, GamificationSnapshot } from "@/lib/server/gamification/types"
import {
  countActiveMatches,
  countUserAchievements,
  getTotalMessagesForUser,
  getTotalProlongCountForUser,
  grantAchievement,
  ensureUserXp,
  getUserXp,
  hasUserAchievement,
  snapshotFromXp,
} from "@/lib/server/gamification/repository"

function isNightUtc(d: Date): boolean {
  const h = d.getUTCHours()
  return h >= 23 || h < 4
}

function isEarlyBirdUtc(d: Date): boolean {
  const h = d.getUTCHours()
  return h >= 4 && h < 8
}

async function tryGrant(userId: string, key: string) {
  if (await hasUserAchievement(userId, key)) return null
  return grantAchievement(userId, key)
}

export async function checkAndGrantAchievements(
  userId: string,
  context: AchievementCheckContext
): Promise<GamificationSnapshot> {
  const unlocked: NonNullable<Awaited<ReturnType<typeof grantAchievement>>>[] = []
  const at = context.at ?? new Date()

  const grant = async (key: string) => {
    const row = await tryGrant(userId, key)
    if (row) unlocked.push(row)
  }

  switch (context.event) {
    case "match_created":
      await grant("first_match")
      break
    case "message_sent": {
      await grant("first_message")
      const total = context.messageCount ?? (await getTotalMessagesForUser(userId))
      if (total >= 100) await grant("chatterbox")
      if (isNightUtc(at)) await grant("night_owl")
      if (isEarlyBirdUtc(at)) await grant("early_bird")
      if (context.bondProlonged) {
        const prolongs = context.prolongCount ?? (await getTotalProlongCountForUser(userId))
        if (prolongs >= 3) await grant("bond_builder")
      }
      break
    }
    case "bond_prolonged": {
      const prolongs = context.prolongCount ?? (await getTotalProlongCountForUser(userId))
      if (prolongs >= 3) await grant("bond_builder")
      break
    }
    case "freeze_used":
      await grant("time_keeper")
      break
    case "profile_updated":
      break
  }

  const active =
    context.activeMatchesCount ?? (await countActiveMatches(userId))
  if (active >= 5) await grant("social_butterfly")

  const nonCollector = await countUserAchievements(userId, "collector")
  if (nonCollector >= 5) await grant("collector")

  const before = await getUserXp(userId)
  await ensureUserXp(userId)
  const after = await getUserXp(userId)
  const xp = after?.xp ?? 0
  const level = after?.level ?? 1
  const leveledUp = (after?.level ?? 1) > (before?.level ?? 1)

  return snapshotFromXp(xp, level, leveledUp, unlocked)
}
