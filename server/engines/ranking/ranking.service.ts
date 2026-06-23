import { getDb } from "@/server/db"
import { priorityLevelFromPairScores } from "@/server/engines/behavior/scoring"
import { getBehaviorUser } from "@/server/engines/behavior/repository"
import type { RankingTier } from "@/server/engines/types"
import type { DiscoverProfile } from "@/client/lib/discover/types"

export type RankedDiscoverProfile = DiscoverProfile & {
  rankingScore: number
  candidateTier: RankingTier
}

const TIER_ORDER: Record<RankingTier, number> = {
  hot: 3,
  normal: 2,
  low: 1,
}

/** Assign match priority 1–5 from both users' behavior scores. */
export async function assignMatchPriority(matchId: string, userA: string, userB: string): Promise<number> {
  const db = getDb()
  if (!db) return 3

  const [a, b] = await Promise.all([getBehaviorUser(userA), getBehaviorUser(userB)])
  const scoreA = a?.behavior_score ?? 70
  const scoreB = b?.behavior_score ?? 70
  const level = priorityLevelFromPairScores(scoreA, scoreB)

  await db`
    UPDATE matches SET priority_level = ${level} WHERE id = ${matchId}
  `

  return level
}

/**
 * Discover ranking: compatibility + behavior tier alignment + visibility.
 * Hot users see more hot-tier candidates; ghosts see fewer impressions.
 */
export async function rankDiscoverProfiles(input: {
  viewerId: string
  profiles: DiscoverProfile[]
}): Promise<RankedDiscoverProfile[]> {
  const viewer = await getBehaviorUser(input.viewerId)
  const viewerTier = viewer?.ranking_tier ?? "normal"
  const viewerVisibility = viewer?.discover_visibility ?? 1
  const viewerScore = viewer?.behavior_score ?? 70

  const db = getDb()
  const tierByUser = new Map<string, RankingTier>()

  if (db && input.profiles.length > 0) {
    const ids = input.profiles.map((p) => p.id)
    const rows = await db<{ id: string; ranking_tier: RankingTier; behavior_score: number; discover_visibility: number }[]>`
      SELECT id, ranking_tier, behavior_score, discover_visibility
      FROM users
      WHERE id = ANY(${ids})
    `
    for (const r of rows) tierByUser.set(r.id, r.ranking_tier)
  }

  const ranked: RankedDiscoverProfile[] = input.profiles.map((p) => {
    const tier = tierByUser.get(p.id) ?? "normal"
    const tierAffinity = 1 - Math.abs(TIER_ORDER[tier] - TIER_ORDER[viewerTier]) / 2
    const compatibilityNorm = (p.compatibility ?? 50) / 100
    const behaviorBoost = tier === "hot" ? 0.12 : tier === "low" ? -0.08 : 0

    let rankingScore =
      compatibilityNorm * 0.45 +
      tierAffinity * 0.35 +
      behaviorBoost +
      (viewerScore / 100) * 0.05

    if (viewerTier === "hot" && tier === "hot") rankingScore += 0.15
    if (viewerTier === "low" && tier === "hot") rankingScore -= 0.2

    rankingScore *= viewerVisibility

    return {
      ...p,
      rankingScore,
      candidateTier: tier,
    }
  })

  return ranked.sort((a, b) => b.rankingScore - a.rankingScore)
}

/** Limit deck size by tier (shadow limit for low performers). */
export function applyVisibilityCap(
  profiles: RankedDiscoverProfile[],
  viewerVisibility: number
): RankedDiscoverProfile[] {
  const cap = Math.max(8, Math.round(40 * viewerVisibility))
  return profiles.slice(0, cap)
}

export function poolLabel(tier: RankingTier): "hot" | "normal" | "low_activity" {
  if (tier === "hot") return "hot"
  if (tier === "low") return "low_activity"
  return "normal"
}
