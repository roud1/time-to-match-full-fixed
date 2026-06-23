import {
  BEHAVIOR_WEIGHTS,
  TIER_THRESHOLDS,
  type RankingTier,
  type UserBehaviorMetrics,
} from "@/server/engines/types"

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** 0–1: faster replies score higher (2h avg → ~0). */
export function fastReplyComponent(responseTimeAvgMs: number | null): number {
  if (responseTimeAvgMs == null || responseTimeAvgMs <= 0) return 0.55
  const twoHours = 2 * 60 * 60 * 1000
  return clamp01(1 - responseTimeAvgMs / twoHours)
}

export function lowIgnoreComponent(ignoreRate: number): number {
  return clamp01(1 - ignoreRate)
}

export function computeBehaviorScore(input: {
  responseTimeAvgMs: number | null
  ignoreRate: number
  activityScore: number
  conversationDepth: number
}): number {
  const fast = fastReplyComponent(input.responseTimeAvgMs)
  const ignore = lowIgnoreComponent(input.ignoreRate)
  const activity = clamp01(input.activityScore)
  const depth = clamp01(input.conversationDepth)

  const raw =
    fast * BEHAVIOR_WEIGHTS.fastReplies +
    ignore * BEHAVIOR_WEIGHTS.lowIgnoreRate +
    activity * BEHAVIOR_WEIGHTS.activity +
    depth * BEHAVIOR_WEIGHTS.depth

  return Math.round(clamp01(raw) * 1000) / 10
}

export function tierFromScore(score: number): RankingTier {
  if (score >= TIER_THRESHOLDS.hot) return "hot"
  if (score >= TIER_THRESHOLDS.normal) return "normal"
  return "low"
}

export function discoverVisibilityFromTier(tier: RankingTier, ghostPenalty = false): number {
  if (ghostPenalty) return 0.35
  switch (tier) {
    case "hot":
      return 1.25
    case "normal":
      return 1
    case "low":
      return 0.55
  }
}

export function priorityLevelFromPairScores(scoreA: number, scoreB: number): number {
  const avg = (scoreA + scoreB) / 2
  return Math.min(5, Math.max(1, Math.ceil(avg / 20)))
}

export function metricsToSnapshot(m: UserBehaviorMetrics) {
  return {
    behaviorScore: m.behaviorScore,
    rankingTier: m.rankingTier,
    discoverVisibility: m.discoverVisibility,
    responseTimeAvgMs: m.responseTimeAvgMs,
    ignoreRate: m.ignoreRate,
    activityScore: m.activityScore,
    conversationDepth: m.conversationDepth,
  }
}
