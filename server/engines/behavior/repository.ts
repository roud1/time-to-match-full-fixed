import { getDb } from "@/server/db"
import type { RankingTier } from "@/server/engines/types"

export type DbBehaviorUser = {
  id: string
  behavior_score: number
  response_time_avg_ms: number | null
  ignore_rate: number
  activity_score: number
  conversation_depth: number
  ranking_tier: RankingTier
  discover_visibility: number
  matches_expired_as_ghost: number
  matches_total: number
  messages_sent_7d: number
}

export async function getBehaviorUser(userId: string): Promise<DbBehaviorUser | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<DbBehaviorUser[]>`
    SELECT
      id,
      behavior_score,
      response_time_avg_ms,
      ignore_rate,
      activity_score,
      conversation_depth,
      ranking_tier,
      discover_visibility,
      matches_expired_as_ghost,
      matches_total,
      messages_sent_7d
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function insertBehaviorEvent(input: {
  userId: string
  eventType: string
  matchId?: string | null
  valueNum?: number | null
  meta?: Record<string, unknown>
}): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    INSERT INTO user_behavior_events (user_id, event_type, match_id, value_num, meta)
    VALUES (
      ${input.userId},
      ${input.eventType},
      ${input.matchId ?? null},
      ${input.valueNum ?? null},
      ${db.json(JSON.parse(JSON.stringify(input.meta ?? {})))}
    )
  `
}

export async function aggregateBehaviorInputs(userId: string): Promise<{
  responseTimeAvgMs: number | null
  ignoreRate: number
  activityScore: number
  conversationDepth: number
  messagesSent7d: number
  matchesTotal: number
  ghostExpires: number
}> {
  const db = getDb()
  if (!db) {
    return {
      responseTimeAvgMs: null,
      ignoreRate: 0,
      activityScore: 0.5,
      conversationDepth: 0,
      messagesSent7d: 0,
      matchesTotal: 0,
      ghostExpires: 0,
    }
  }

  const replyRows = await db<{ avg_ms: string | null }[]>`
    WITH ordered AS (
      SELECT
        mm.match_id,
        mm.sender_id,
        mm.created_at,
        LAG(mm.created_at) OVER (PARTITION BY mm.match_id ORDER BY mm.created_at) AS prev_at,
        LAG(mm.sender_id) OVER (PARTITION BY mm.match_id ORDER BY mm.created_at) AS prev_sender
      FROM match_messages mm
      INNER JOIN matches m ON m.id = mm.match_id
      WHERE mm.sender_id = ${userId}
        AND mm.created_at > now() - interval '30 days'
    )
    SELECT AVG(EXTRACT(EPOCH FROM (created_at - prev_at)) * 1000)::text AS avg_ms
    FROM ordered
    WHERE prev_sender IS NOT NULL
      AND prev_sender <> sender_id
      AND prev_at IS NOT NULL
  `

  const msg7d = await db<{ c: string }[]>`
    SELECT COUNT(*)::text AS c
    FROM match_messages
    WHERE sender_id = ${userId}
      AND created_at > now() - interval '7 days'
  `

  const matchStats = await db<{
    total: string
    ghost: string
    depth_avg: string | null
  }[]>`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE non_responder_id = ${userId} AND status = 'expired')::text AS ghost,
      AVG(
        (SELECT COUNT(*)::float FROM match_messages mm WHERE mm.match_id = m.id)
      )::text AS depth_avg
    FROM matches m
    WHERE (m.user1_id = ${userId} OR m.user2_id = ${userId})
      AND m.created_at > now() - interval '90 days'
  `

  const messagesSent7d = Number.parseInt(msg7d[0]?.c ?? "0", 10)
  const matchesTotal = Number.parseInt(matchStats[0]?.total ?? "0", 10)
  const ghostExpires = Number.parseInt(matchStats[0]?.ghost ?? "0", 10)
  const depthAvg = matchStats[0]?.depth_avg ? Number.parseFloat(matchStats[0].depth_avg) : 0

  const avgMsRaw = replyRows[0]?.avg_ms
  const responseTimeAvgMs = avgMsRaw != null ? Math.round(Number.parseFloat(avgMsRaw)) : null

  const ignoreRate = matchesTotal > 0 ? ghostExpires / matchesTotal : 0
  const activityScore = Math.min(1, messagesSent7d / 14)
  const conversationDepth = Math.min(1, depthAvg / 40)

  return {
    responseTimeAvgMs,
    ignoreRate,
    activityScore,
    conversationDepth,
    messagesSent7d,
    matchesTotal,
    ghostExpires,
  }
}

export async function persistUserBehavior(input: {
  userId: string
  behaviorScore: number
  responseTimeAvgMs: number | null
  ignoreRate: number
  activityScore: number
  conversationDepth: number
  rankingTier: RankingTier
  discoverVisibility: number
  messagesSent7d: number
  matchesTotal: number
  ghostExpires: number
}): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE users
    SET
      behavior_score = ${input.behaviorScore},
      response_time_avg_ms = ${input.responseTimeAvgMs},
      ignore_rate = ${input.ignoreRate},
      activity_score = ${input.activityScore},
      conversation_depth = ${input.conversationDepth},
      ranking_tier = ${input.rankingTier},
      discover_visibility = ${input.discoverVisibility},
      messages_sent_7d = ${input.messagesSent7d},
      matches_total = ${input.matchesTotal},
      matches_expired_as_ghost = ${input.ghostExpires},
      last_behavior_at = now()
    WHERE id = ${input.userId}
  `
}
