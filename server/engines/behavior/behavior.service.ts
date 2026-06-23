import {
  computeBehaviorScore,
  discoverVisibilityFromTier,
  metricsToSnapshot,
  tierFromScore,
} from "@/server/engines/behavior/scoring"
import {
  aggregateBehaviorInputs,
  getBehaviorUser,
  insertBehaviorEvent,
  persistUserBehavior,
} from "@/server/engines/behavior/repository"
import type { UserBehaviorMetrics } from "@/server/engines/types"
import { log } from "@/server/log"

/** Recompute and persist user_score from live DB signals. */
export async function recomputeUserBehavior(userId: string): Promise<UserBehaviorMetrics | null> {
  const inputs = await aggregateBehaviorInputs(userId)

  const behaviorScore = computeBehaviorScore({
    responseTimeAvgMs: inputs.responseTimeAvgMs,
    ignoreRate: inputs.ignoreRate,
    activityScore: inputs.activityScore,
    conversationDepth: inputs.conversationDepth,
  })

  const rankingTier = tierFromScore(behaviorScore)
  const ghostPenalty = inputs.ignoreRate > 0.35 && inputs.matchesTotal >= 3
  const discoverVisibility = discoverVisibilityFromTier(rankingTier, ghostPenalty)

  await persistUserBehavior({
    userId,
    behaviorScore,
    responseTimeAvgMs: inputs.responseTimeAvgMs,
    ignoreRate: inputs.ignoreRate,
    activityScore: inputs.activityScore,
    conversationDepth: inputs.conversationDepth,
    rankingTier,
    discoverVisibility,
    messagesSent7d: inputs.messagesSent7d,
    matchesTotal: inputs.matchesTotal,
    ghostExpires: inputs.ghostExpires,
  })

  await insertBehaviorEvent({
    userId,
    eventType: "score_recomputed",
    valueNum: behaviorScore,
    meta: metricsToSnapshot({
      userId,
      behaviorScore,
      rankingTier,
      discoverVisibility,
      responseTimeAvgMs: inputs.responseTimeAvgMs,
      ignoreRate: inputs.ignoreRate,
      activityScore: inputs.activityScore,
      conversationDepth: inputs.conversationDepth,
    }),
  })

  return {
    userId,
    behaviorScore,
    rankingTier,
    discoverVisibility,
    responseTimeAvgMs: inputs.responseTimeAvgMs,
    ignoreRate: inputs.ignoreRate,
    activityScore: inputs.activityScore,
    conversationDepth: inputs.conversationDepth,
  }
}

export async function getUserBehaviorMetrics(userId: string): Promise<UserBehaviorMetrics | null> {
  const row = await getBehaviorUser(userId)
  if (!row) return null
  return {
    userId: row.id,
    behaviorScore: row.behavior_score,
    rankingTier: row.ranking_tier,
    discoverVisibility: row.discover_visibility,
    responseTimeAvgMs: row.response_time_avg_ms,
    ignoreRate: row.ignore_rate,
    activityScore: row.activity_score,
    conversationDepth: row.conversation_depth,
  }
}

/** Call after a message is stored (server path). */
export async function onMessageSent(input: {
  senderId: string
  matchId: string
  responseTimeMs?: number | null
  isFirstInMatch?: boolean
}): Promise<void> {
  if (input.responseTimeMs != null && input.responseTimeMs > 0) {
    await insertBehaviorEvent({
      userId: input.senderId,
      eventType: input.isFirstInMatch ? "message_sent" : "message_reply",
      matchId: input.matchId,
      valueNum: input.responseTimeMs,
    })
  } else {
    await insertBehaviorEvent({
      userId: input.senderId,
      eventType: input.isFirstInMatch ? "message_sent" : "message_reply",
      matchId: input.matchId,
    })
  }

  await recomputeUserBehavior(input.senderId)
}

/** Penalize user who let a match expire without replying. */
export async function onMatchGhosted(input: {
  ghostUserId: string
  matchId: string
}): Promise<void> {
  await insertBehaviorEvent({
    userId: input.ghostUserId,
    eventType: "match_ghost",
    matchId: input.matchId,
  })

  const row = await getBehaviorUser(input.ghostUserId)
  if (row) {
    await persistUserBehavior({
      userId: input.ghostUserId,
      behaviorScore: Math.max(10, row.behavior_score - 8),
      responseTimeAvgMs: row.response_time_avg_ms,
      ignoreRate: Math.min(1, row.ignore_rate + 0.08),
      activityScore: row.activity_score,
      conversationDepth: row.conversation_depth,
      rankingTier: tierFromScore(Math.max(10, row.behavior_score - 8)),
      discoverVisibility: 0.35,
      messagesSent7d: row.messages_sent_7d,
      matchesTotal: row.matches_total + 1,
      ghostExpires: row.matches_expired_as_ghost + 1,
    })
  }

  await recomputeUserBehavior(input.ghostUserId)
  log.info("behavior_match_ghost", { userId: input.ghostUserId, matchId: input.matchId })
}

export async function onMatchCreated(userA: string, userB: string, matchId: string): Promise<void> {
  await insertBehaviorEvent({ userId: userA, eventType: "match_created", matchId })
  await insertBehaviorEvent({ userId: userB, eventType: "match_created", matchId })
}
