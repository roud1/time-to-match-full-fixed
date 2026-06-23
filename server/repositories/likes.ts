import { getDb } from "@/server/db"
import { checkAndGrantAchievements } from "@/server/gamification/check"
import { matchExpiresAt } from "@/server/match-engine/constants"
import { createMatchForPair } from "@/server/match-engine/repository"
import { findUserById } from "@/server/repositories/users"
import type { MatchStatus } from "@/server/match-engine/types"
import type { MatchDto } from "@/server/matches/types"
import { bondStatsFromRow } from "@/server/repositories/match-stats"

export type DbLikeRow = {
  id: string
  from_user: string
  to_user: string
  created_at: Date
  expires_at: Date | null
  is_match: boolean
  is_expired: boolean
  is_frozen: boolean
  match_id: string | null
}

type DbLikeWithBond = DbLikeRow & {
  stat_total_messages: number | null
  stat_prolong_count: number | null
  stat_last_prolonged_at: Date | null
  engine_status: MatchStatus | null
}

function rowToMatch(row: DbLikeWithBond, peerName: string | null): MatchDto {
  const status =
    row.engine_status ??
    (row.is_expired ? "expired" : row.stat_total_messages && row.stat_total_messages > 0 ? "waiting_reply" : "new_match")

  return {
    id: row.id,
    peerUserId: row.to_user,
    peerName,
    expiresAt: (row.expires_at ?? new Date()).toISOString(),
    isFrozen: row.is_frozen,
    isExpired: row.is_expired || status === "expired",
    status,
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
      l.match_id,
      ms.total_messages AS stat_total_messages,
      ms.prolong_count AS stat_prolong_count,
      ms.last_prolonged_at AS stat_last_prolonged_at,
      m.status AS engine_status,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    LEFT JOIN match_stats ms ON ms.match_id = l.id
    LEFT JOIN matches m ON m.id = l.match_id
    WHERE l.id = ${matchId}
      AND l.from_user = ${userId}
      AND l.is_match = true
    LIMIT 1
  `
  return rows[0] ?? null
}

/** Resolve a user's like row when the client passed engine `matches.id` instead of `likes.id`. */
export async function findLikeByEngineMatchIdForUser(
  engineMatchId: string,
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
      l.match_id,
      ms.total_messages AS stat_total_messages,
      ms.prolong_count AS stat_prolong_count,
      ms.last_prolonged_at AS stat_last_prolonged_at,
      m.status AS engine_status,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    LEFT JOIN match_stats ms ON ms.match_id = l.id
    LEFT JOIN matches m ON m.id = l.match_id
    WHERE l.match_id = ${engineMatchId}
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
      l.match_id,
      ms.total_messages AS stat_total_messages,
      ms.prolong_count AS stat_prolong_count,
      ms.last_prolonged_at AS stat_last_prolonged_at,
      m.status AS engine_status,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    LEFT JOIN match_stats ms ON ms.match_id = l.id
    LEFT JOIN matches m ON m.id = l.match_id
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
  const createdAt = new Date(expiresAt.getTime() - 24 * 60 * 60 * 1000)

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

  const engineMatch = await createMatchForPair({ userA, userB, createdAt, expiresAt })
  const { integrateMatchCreated } = await import("@/server/engines/integration")
  await integrateMatchCreated(engineMatch.id, userA, userB)

  await checkAndGrantAchievements(userA, { event: "match_created", activeMatchesCount: undefined })
  await checkAndGrantAchievements(userB, { event: "match_created", activeMatchesCount: undefined })

  const { scheduleNewMatchNotifications } = await import("@/server/notifications/repository")
  await scheduleNewMatchNotifications(userA, userB)
}

export type RecordLikeResult =
  | { ok: true; liked: true; matched: false }
  | { ok: true; liked: true; matched: true; matchId: string }
  | { ok: false; code: "not_found" | "self" | "blocked" }

export type RecordPassResult =
  | { ok: true; passed: true }
  | { ok: false; code: "not_found" | "self" | "blocked" }

export async function recordLikeForUser(
  fromUserId: string,
  targetUserId: string
): Promise<RecordLikeResult> {
  if (fromUserId === targetUserId) return { ok: false, code: "self" }

  const db = getDb()
  if (!db) return { ok: false, code: "not_found" }

  const target = await findUserById(targetUserId)
  if (!target || !target.is_active || target.is_blocked) {
    return { ok: false, code: "not_found" }
  }

  const viewer = await findUserById(fromUserId)
  if (!viewer || viewer.is_blocked) return { ok: false, code: "blocked" }

  const { isEitherBlocked } = await import("@/server/repositories/moderation")
  if (await isEitherBlocked(fromUserId, targetUserId)) {
    return { ok: false, code: "not_found" }
  }

  const existing = await db<{ id: string; is_match: boolean }[]>`
    SELECT id, is_match FROM likes
    WHERE from_user = ${fromUserId} AND to_user = ${targetUserId}
    LIMIT 1
  `
  if (existing[0]?.is_match) {
    return { ok: true, liked: true, matched: true, matchId: existing[0].id }
  }

  await db`
    DELETE FROM discover_passes
    WHERE from_user = ${fromUserId} AND to_user = ${targetUserId}
  `

  const reverse = await db<{ id: string; is_match: boolean }[]>`
    SELECT id, is_match FROM likes
    WHERE from_user = ${targetUserId} AND to_user = ${fromUserId}
    LIMIT 1
  `

  const isMutual = Boolean(reverse[0] && !reverse[0].is_match)

  if (isMutual) {
    const expiresAt = matchExpiresAt()
    await createMutualMatchLikes({ userA: fromUserId, userB: targetUserId, expiresAt })

    const likeRow = await db<{ id: string }[]>`
      SELECT id FROM likes
      WHERE from_user = ${fromUserId} AND to_user = ${targetUserId} AND is_match = true
      LIMIT 1
    `
    const matchId = likeRow[0]?.id
    if (!matchId) return { ok: false, code: "not_found" }
    return { ok: true, liked: true, matched: true, matchId }
  }

  await db`
    INSERT INTO likes (from_user, to_user, is_match, is_frozen, is_expired)
    VALUES (${fromUserId}, ${targetUserId}, false, false, false)
    ON CONFLICT (from_user, to_user) DO UPDATE SET
      is_match = CASE WHEN likes.is_match THEN true ELSE false END,
      is_expired = false
  `

  return { ok: true, liked: true, matched: false }
}

export async function recordPassForUser(
  fromUserId: string,
  targetUserId: string
): Promise<RecordPassResult> {
  if (fromUserId === targetUserId) return { ok: false, code: "self" }

  const db = getDb()
  if (!db) return { ok: false, code: "not_found" }

  const target = await findUserById(targetUserId)
  if (!target || !target.is_active || target.is_blocked) {
    return { ok: false, code: "not_found" }
  }

  const viewer = await findUserById(fromUserId)
  if (!viewer || viewer.is_blocked) return { ok: false, code: "blocked" }

  await db`
    INSERT INTO discover_passes (from_user, to_user)
    VALUES (${fromUserId}, ${targetUserId})
    ON CONFLICT (from_user, to_user) DO NOTHING
  `

  await db`
    DELETE FROM likes
    WHERE from_user = ${fromUserId}
      AND to_user = ${targetUserId}
      AND is_match = false
  `

  return { ok: true, passed: true }
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
  const nextExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db`
    UPDATE likes
    SET
      expires_at = ${nextExpiry},
      is_frozen = CASE WHEN ${setFrozen} THEN true ELSE is_frozen END,
      is_expired = false
    WHERE is_match = true
      AND (
        (from_user = ${userId} AND to_user = ${peerId})
        OR (from_user = ${peerId} AND to_user = ${userId})
      )
  `

  const link = await db<{ match_id: string | null }[]>`
    SELECT match_id FROM likes
    WHERE from_user = ${userId} AND to_user = ${peerId} AND is_match = true
    LIMIT 1
  `
  const matchId = link[0]?.match_id
  if (matchId) {
    const { syncMatchExpiry } = await import("@/server/match-engine/repository")
    await syncMatchExpiry(matchId, nextExpiry, true)
  }
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
