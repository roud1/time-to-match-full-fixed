import { getDb } from "@/lib/server/db"
import {
  BOND_MESSAGES_PER_PROLONG,
  BOND_PROLONG_COOLDOWN_MS,
  BOND_PROLONG_HOURS,
  messagesUntilNextFromTotal,
} from "@/lib/server/matches/bond-constants"
import type { MessageSentResponse } from "@/lib/server/matches/types"
import { syncMatchExpiry } from "@/lib/server/match-engine/repository"
import { findMatchByIdForUser, type DbLikeRow } from "@/lib/server/repositories/likes"

export type DbMatchStatsRow = {
  id: string
  match_id: string
  total_messages: number
  last_prolonged_at: Date | null
  prolong_count: number
}

export function computeBondFromStats(totalMessages: number, prolongCount: number) {
  const bondLevel = Math.floor(totalMessages / BOND_MESSAGES_PER_PROLONG)
  const bondProgress =
    BOND_MESSAGES_PER_PROLONG > 0
      ? (totalMessages % BOND_MESSAGES_PER_PROLONG) / BOND_MESSAGES_PER_PROLONG
      : 0
  return { bondLevel, bondProgress, totalMessages, prolongCount }
}

export function bondStatsFromRow(
  row: Pick<DbMatchStatsRow, "total_messages" | "prolong_count" | "last_prolonged_at"> | null | undefined
) {
  const totalMessages = row?.total_messages ?? 0
  const prolongCount = row?.prolong_count ?? 0
  const { bondLevel, bondProgress } = computeBondFromStats(totalMessages, prolongCount)
  return {
    totalMessages,
    prolongCount,
    bondLevel,
    bondProgress,
    messagesUntilNext: messagesUntilNextFromTotal(totalMessages),
    lastProlongedAt: row?.last_prolonged_at?.toISOString() ?? null,
  }
}

async function prolongMatchPair(
  db: NonNullable<ReturnType<typeof getDb>>,
  userId: string,
  peerId: string,
  engineMatchId: string | null
) {
  await db`
    UPDATE likes
    SET
      expires_at = GREATEST(expires_at, now()) + interval '6 hours',
      is_expired = false
    WHERE is_match = true
      AND (
        (from_user = ${userId} AND to_user = ${peerId})
        OR (from_user = ${peerId} AND to_user = ${userId})
      )
  `

  if (engineMatchId) {
    await db`
      UPDATE matches
      SET expires_at = GREATEST(expires_at, now()) + interval '6 hours'
      WHERE id = ${engineMatchId}
    `
    const rows = await db<{ expires_at: Date }[]>`
      SELECT expires_at FROM matches WHERE id = ${engineMatchId} LIMIT 1
    `
    const next = rows[0]?.expires_at
    if (next) await syncMatchExpiry(engineMatchId, next, true)
  }
}

function canProlongNow(lastProlongedAt: Date | null): boolean {
  if (!lastProlongedAt) return true
  return Date.now() - lastProlongedAt.getTime() >= BOND_PROLONG_COOLDOWN_MS
}

export type RecordMessageSentResult =
  | { ok: true; payload: MessageSentResponse; peerId: string }
  | { ok: false; code: "not_found" | "expired" }

export async function recordMessageSentForMatch(
  matchId: string,
  userId: string
): Promise<RecordMessageSentResult> {
  const db = getDb()
  if (!db) return { ok: false, code: "not_found" }

  const like = await findMatchByIdForUser(matchId, userId)
  if (!like) return { ok: false, code: "not_found" }
  if (like.is_expired) return { ok: false, code: "expired" }
  if (!like.expires_at || like.expires_at <= new Date()) {
    return { ok: false, code: "expired" }
  }

  const peerId = like.to_user
  const engineMatchId = like.match_id

  const rows = await db<DbMatchStatsRow[]>`
    INSERT INTO match_stats (match_id, total_messages, updated_at)
    VALUES (${matchId}, 1, now())
    ON CONFLICT (match_id) DO UPDATE SET
      total_messages = match_stats.total_messages + 1,
      updated_at = now()
    RETURNING id, match_id, total_messages, last_prolonged_at, prolong_count
  `
  const stats = rows[0]
  if (!stats) return { ok: false, code: "not_found" }

  let prolonged = false
  let newExpiresAt: string | undefined

  const shouldCheckProlong =
    stats.total_messages > 0 && stats.total_messages % BOND_MESSAGES_PER_PROLONG === 0

  if (shouldCheckProlong && canProlongNow(stats.last_prolonged_at)) {
    await prolongMatchPair(db, userId, peerId, engineMatchId)
    const updatedStats = await db<DbMatchStatsRow[]>`
      UPDATE match_stats
      SET
        last_prolonged_at = now(),
        prolong_count = prolong_count + 1,
        updated_at = now()
      WHERE match_id = ${matchId}
      RETURNING id, match_id, total_messages, last_prolonged_at, prolong_count
    `
    const next = updatedStats[0] ?? stats
    prolonged = true

    const refreshed = await findMatchByIdForUser(matchId, userId)
    newExpiresAt = refreshed?.expires_at?.toISOString()

    const bond = computeBondFromStats(next.total_messages, next.prolong_count)
    return {
      ok: true,
      peerId,
      payload: {
        prolonged: true,
        newExpiresAt,
        bondLevel: bond.bondLevel,
        totalMessages: next.total_messages,
        bondProgress: bond.bondProgress,
        prolongCount: next.prolong_count,
        messagesUntilNext: BOND_MESSAGES_PER_PROLONG,
        addedHours: BOND_PROLONG_HOURS,
      },
    }
  }

  const bond = computeBondFromStats(stats.total_messages, stats.prolong_count)
  return {
    ok: true,
    peerId,
    payload: {
      prolonged: false,
      bondLevel: bond.bondLevel,
      totalMessages: stats.total_messages,
      bondProgress: bond.bondProgress,
      prolongCount: stats.prolong_count,
      messagesUntilNext: messagesUntilNextFromTotal(stats.total_messages),
    },
  }
}
