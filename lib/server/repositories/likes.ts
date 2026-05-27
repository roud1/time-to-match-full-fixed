import { getDb } from "@/lib/server/db"
import { checkAndGrantAchievements } from "@/lib/server/gamification/check"
import type { MatchDto } from "@/lib/server/matches/types"
import { bondStatsFromRow } from "@/lib/server/repositories/match-stats"

export type DbLikeRow = {
  id: string
  from_user: string
  to_user: string
  created_at: Date
  expires_at: Date | null
  is_match: boolean
  is_expired: boolean
  is_frozen: boolean
}

type DbLikeWithBond = DbLikeRow & {
  stat_total_messages: number | null
  stat_prolong_count: number | null
  stat_last_prolonged_at: Date | null
}

function rowToMatch(row: DbLikeWithBond, peerName: string | null): MatchDto {
  return {
    id: row.id,
    peerUserId: row.to_user,
    peerName,
    expiresAt: (row.expires_at ?? new Date()).toISOString(),
    isFrozen: row.is_frozen,
    isExpired: row.is_expired,
    bond: bondStatsFromRow(
      row.stat_total_messages != null
        ? {
            total_messages: row.stat_total_messages,
            prolong_count: row.stat_prolong_count ?? 0,
            last_prolonged_at: row.stat_last_prolonged_at,
          }
        : null
    ),
  }
}

export async function findMatchByIdForUser(
  matchId: string,
  userId: string
): Promise<(DbLikeWithBond & { peer_name: string | null }) | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<(DbLikeWithBond & { peer_name: string | null })[]>`
    SELECT
      l.id,
      l.from_user,
      l.to_user,
      l.created_at,
      l.expires_at,
      l.is_match,
      l.is_expired,
      l.is_frozen,
      ms.total_messages AS stat_total_messages,
      ms.prolong_count AS stat_prolong_count,
      ms.last_prolonged_at AS stat_last_prolonged_at,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    LEFT JOIN match_stats ms ON ms.match_id = l.id
    WHERE l.id = ${matchId}
      AND l.from_user = ${userId}
      AND l.is_match = true
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function listActiveMatchesForUser(userId: string): Promise<MatchDto[]> {
  const db = getDb()
  if (!db) return []

  const rows = await db<(DbLikeWithBond & { peer_name: string | null })[]>`
    SELECT
      l.id,
      l.from_user,
      l.to_user,
      l.created_at,
      l.expires_at,
      l.is_match,
      l.is_expired,
      l.is_frozen,
      ms.total_messages AS stat_total_messages,
      ms.prolong_count AS stat_prolong_count,
      ms.last_prolonged_at AS stat_last_prolonged_at,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    LEFT JOIN match_stats ms ON ms.match_id = l.id
    WHERE l.from_user = ${userId}
      AND l.is_match = true
      AND l.is_expired = false
      AND l.expires_at IS NOT NULL
      AND l.expires_at > now()
    ORDER BY l.expires_at ASC
  `

  return rows.map((r) => rowToMatch(r, r.peer_name))
}

export async function createMutualMatchLikes(input: {
  userA: string
  userB: string
  expiresAt: Date
}): Promise<void> {
  const db = getDb()
  if (!db) return

  const { userA, userB, expiresAt } = input

  await db`
    INSERT INTO likes (from_user, to_user, expires_at, is_match, is_frozen)
    VALUES (${userA}, ${userB}, ${expiresAt}, true, false)
    ON CONFLICT (from_user, to_user) DO UPDATE SET
      expires_at = EXCLUDED.expires_at,
      is_match = true,
      is_expired = false
  `

  await db`
    INSERT INTO likes (from_user, to_user, expires_at, is_match, is_frozen)
    VALUES (${userB}, ${userA}, ${expiresAt}, true, false)
    ON CONFLICT (from_user, to_user) DO UPDATE SET
      expires_at = EXCLUDED.expires_at,
      is_match = true,
      is_expired = false
  `

  await checkAndGrantAchievements(userA, { event: "match_created", activeMatchesCount: undefined })
  await checkAndGrantAchievements(userB, { event: "match_created", activeMatchesCount: undefined })
}

export type FreezeMatchResult =
  | { ok: true; match: MatchDto; usedPaid: boolean }
  | { ok: false; code: "not_found" | "expired" | "no_freezes" }

const FREEZE_COOLDOWN_MS = 24 * 60 * 60 * 1000

function hasFreeFreezeAvailable(lastFreezeAt: Date | null): boolean {
  if (!lastFreezeAt) return true
  return Date.now() - lastFreezeAt.getTime() >= FREEZE_COOLDOWN_MS
}

async function extendMatchExpiry(
  db: NonNullable<ReturnType<typeof getDb>>,
  userId: string,
  peerId: string,
  setFrozen: boolean
) {
  await db`
    UPDATE likes
    SET
      expires_at = now() + interval '24 hours',
      is_frozen = CASE WHEN ${setFrozen} THEN true ELSE is_frozen END,
      is_expired = false
    WHERE is_match = true
      AND (
        (from_user = ${userId} AND to_user = ${peerId})
        OR (from_user = ${peerId} AND to_user = ${userId})
      )
  `
}

export async function freezeMatchForUser(
  matchId: string,
  userId: string
): Promise<FreezeMatchResult> {
  const db = getDb()
  if (!db) return { ok: false, code: "not_found" }

  const like = await findMatchByIdForUser(matchId, userId)
  if (!like) return { ok: false, code: "not_found" }
  if (like.is_expired) return { ok: false, code: "expired" }
  if (!like.expires_at || like.expires_at <= new Date()) {
    return { ok: false, code: "expired" }
  }

  const userRows = await db<{ last_freeze_at: Date | null; freeze_balance: number }[]>`
    SELECT last_freeze_at, freeze_balance FROM users WHERE id = ${userId} LIMIT 1
  `
  const wallet = userRows[0]
  if (!wallet) return { ok: false, code: "not_found" }

  const peerId = like.to_user
  const freeAvailable = !like.is_frozen && hasFreeFreezeAvailable(wallet.last_freeze_at)

  if (freeAvailable) {
    await extendMatchExpiry(db, userId, peerId, true)
    await db`UPDATE users SET last_freeze_at = now() WHERE id = ${userId}`
  } else if (wallet.freeze_balance > 0) {
    const deducted = await db<{ freeze_balance: number }[]>`
      UPDATE users
      SET freeze_balance = freeze_balance - 1
      WHERE id = ${userId} AND freeze_balance > 0
      RETURNING freeze_balance
    `
    if (!deducted.length) {
      return { ok: false, code: "no_freezes" }
    }
    await extendMatchExpiry(db, userId, peerId, !like.is_frozen)
  } else {
    return { ok: false, code: "no_freezes" }
  }

  const updated = await findMatchByIdForUser(matchId, userId)
  if (!updated) return { ok: false, code: "not_found" }

  return {
    ok: true,
    match: rowToMatch(updated, updated.peer_name),
    usedPaid: !freeAvailable,
  }
}
