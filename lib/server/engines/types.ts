export type RankingTier = "hot" | "normal" | "low"

export type MatchUrgencyLevel = "normal" | "low_visibility" | "warning" | "critical" | "expired"

export type UserBehaviorMetrics = {
  userId: string
  responseTimeAvgMs: number | null
  ignoreRate: number
  activityScore: number
  conversationDepth: number
  behaviorScore: number
  rankingTier: RankingTier
  discoverVisibility: number
}

export const BEHAVIOR_WEIGHTS = {
  fastReplies: 0.4,
  lowIgnoreRate: 0.3,
  activity: 0.2,
  depth: 0.1,
} as const

export const TIER_THRESHOLDS = {
  hot: 75,
  normal: 45,
} as const

export const URGENCY_HOURS = {
  lowVisibility: 6,
  warning: 12,
  critical: 23,
} as const
