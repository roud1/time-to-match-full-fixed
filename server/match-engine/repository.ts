import { getDb } from "@/server/db"
import { isUser1, matchExpiresAt, orderedPair } from "@/server/match-engine/constants"
import { nextStatusAfterSend } from "@/server/match-engine/state"
import type {
  DbMatchMessageRow,
  DbMatchRow,
  ExpireMatchesResult,
  MatchDetailDto,
  MatchEngineDto,
  MatchStatus,
  SendMatchMessageResult,
} from "@/server/match-engine/types"

type LikeContext = {
  like_id: string
  match_id: string | null
  from_user: string
  to_user: string
  peer_name: string | null
}

type DbMatchRowExtended = DbMatchRow & {
  priority_level?: number
  urgency_level?: import("@/server/match-engine/types").MatchUrgencyLevel
}

function rowToDto(row: DbMatchRowExtended, viewerId: string, peerName: string | null): MatchEngineDto {
  const peerUserId = row.user1_id === viewerId ? row.user2_id : row.user1_id
  const viewerIsUser1 = row.user1_id === viewerId
  return {
    id: row.id,
    peerUserId,
    peerName,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at.toISOString(),
    status: row.status,
    isExpired: row.status === "expired" || row.expires_at <= new Date(),
    userHasSent: viewerIsUser1 ? row.user1_has_sent : row.user2_has_sent,
    peerHasSent: viewerIsUser1 ? row.user2_has_sent : row.user1_has_sent,
    priorityLevel: row.priority_level,
    urgencyLevel: row.urgency_level,
  }
}

export async function findLikeContext(
  likeId: string,
  userId: string
): Promise<LikeContext | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<LikeContext[]>`
    SELECT
      l.id AS like_id,
      l.match_id,
      l.from_user,
      l.to_user,
      peer.name AS peer_name
    FROM likes l
    LEFT JOIN users peer ON peer.id = l.to_user
    WHERE l.id = ${likeId}
      AND l.from_user = ${userId}
      AND l.is_match = true
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function getMatchById(matchId: string): Promise<DbMatchRow | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<DbMatchRow[]>`
    SELECT
      id, user1_id, user2_id, created_at, expires_at, status,
      user1_has_sent, user2_has_sent, expired_at
    FROM matches
    WHERE id = ${matchId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function getMatchForUser(
  likeId: string,
  userId: string
): Promise<{ like: LikeContext; match: DbMatchRow } | null> {
  const like = await findLikeContext(likeId, userId)
  if (!like?.match_id) return null

  const match = await getMatchById(like.match_id)
  if (!match) return null
  if (match.user1_id !== userId && match.user2_id !== userId) return null

  return { like, match }
}

export async function getMatchDetailForUser(
  likeId: string,
  userId: string,
  messageLimit = 50
): Promise<MatchDetailDto | null> {
  const ctx = await getMatchForUser(likeId, userId)
  if (!ctx) return null

  const db = getDb()
  if (!db) return null

  const messages = await db<DbMatchMessageRow[]>`
    SELECT id, match_id, sender_id, body, created_at
    FROM match_messages
    WHERE match_id = ${ctx.match.id}
    ORDER BY created_at ASC
    LIMIT ${messageLimit}
  `

  const base = rowToDto(ctx.match, userId, ctx.like.peer_name)
  return {
    ...base,
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      body: m.body,
      createdAt: m.created_at.toISOString(),
      isMine: m.sender_id === userId,
    })),
  }
}

export async function listMatchesForUser(userId: string): Promise<MatchEngineDto[]> {
  const db = getDb()
  if (!db) return []

  const rows = await db<(DbMatchRow & { peer_name: string | null })[]>`
    SELECT
      m.id,
      m.user1_id,
      m.user2_id,
      m.created_at,
      m.expires_at,
      m.status,
      m.user1_has_sent,
      m.user2_has_sent,
      m.expired_at,
      m.priority_level,
      m.urgency_level,
      peer.name AS peer_name
    FROM matches m
    JOIN likes l
      ON l.match_id = m.id
     AND l.from_user = ${userId}
     AND l.is_match = true
    LEFT JOIN users peer ON peer.id = l.to_user
    WHERE m.status <> 'expired'
      AND m.expires_at > now()
    ORDER BY m.expires_at ASC
  `

  return rows.map((r) => rowToDto(r, userId, r.peer_name))
}

export async function createMatchForPair(input: {
  userA: string
  userB: string
  createdAt?: Date
  expiresAt?: Date
}): Promise<DbMatchRow> {
  const db = getDb()
  if (!db) throw new Error("Database not configured")

  const { user1Id, user2Id } = orderedPair(input.userA, input.userB)
  const createdAt = input.createdAt ?? new Date()
  const expiresAt = input.expiresAt ?? matchExpiresAt(createdAt)

  const rows = await db<DbMatchRow[]>`
    INSERT INTO matches (user1_id, user2_id, created_at, expires_at, status)
    VALUES (${user1Id}, ${user2Id}, ${createdAt}, ${expiresAt}, 'new_match')
    ON CONFLICT (user1_id, user2_id) DO UPDATE SET
      expires_at = CASE
        WHEN matches.status = 'expired' THEN matches.expires_at
        ELSE GREATEST(matches.expires_at, EXCLUDED.expires_at)
      END
    RETURNING
      id, user1_id, user2_id, created_at, expires_at, status,
      user1_has_sent, user2_has_sent, expired_at
  `

  const match = rows[0]
  if (!match) throw new Error("Failed to create match")

  await db`
    UPDATE likes
    SET
      match_id = ${match.id},
      expires_at = ${expiresAt},
      is_match = true,
      is_expired = false
    WHERE (from_user = ${input.userA} AND to_user = ${input.userB})
       OR (from_user = ${input.userB} AND to_user = ${input.userA})
  `

  return match
}

export async function syncMatchExpiry(
  matchId: string,
  expiresAt: Date,
  revive = false
): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE matches
    SET expires_at = ${expiresAt}
    WHERE id = ${matchId}
  `

  if (revive) {
    await db`
      UPDATE likes
      SET expires_at = ${expiresAt}, is_expired = false
      WHERE match_id = ${matchId}
    `
  } else {
    await db`
      UPDATE likes SET expires_at = ${expiresAt} WHERE match_id = ${matchId}
    `
  }
}

export async function sendMatchMessage(input: {
  likeId: string
  senderId: string
  body: string
}): Promise<SendMatchMessageResult> {
  const db = getDb()
  if (!db) return { ok: false, code: "not_found" }

  const trimmed = input.body.trim()
  if (!trimmed) return { ok: false, code: "forbidden" }

  return db.begin(async (sql) => {
    const likeRows = await sql<LikeContext[]>`
      SELECT
        l.id AS like_id,
        l.match_id,
        l.from_user,
        l.to_user,
        peer.name AS peer_name
      FROM likes l
      LEFT JOIN users peer ON peer.id = l.to_user
      WHERE l.id = ${input.likeId}
        AND l.from_user = ${input.senderId}
        AND l.is_match = true
      FOR UPDATE
    `
    const like = likeRows[0]
    if (!like?.match_id) return { ok: false, code: "not_found" } as const

    const matchRows = await sql<DbMatchRow[]>`
      SELECT
        id, user1_id, user2_id, created_at, expires_at, status,
        user1_has_sent, user2_has_sent, expired_at
      FROM matches
      WHERE id = ${like.match_id}
      FOR UPDATE
    `
    const match = matchRows[0]
    if (!match) return { ok: false, code: "not_found" } as const

    if (match.user1_id !== input.senderId && match.user2_id !== input.senderId) {
      return { ok: false, code: "forbidden" } as const
    }

    const now = new Date()
    if (match.status === "expired" || match.expires_at <= now) {
      await sql`
        UPDATE matches
        SET status = 'expired', expired_at = COALESCE(expired_at, now())
        WHERE id = ${match.id} AND status <> 'expired'
      `
      await sql`
        UPDATE likes SET is_expired = true WHERE match_id = ${match.id}
      `
      return { ok: false, code: "expired" } as const
    }

    const statusBefore = match.status
    const senderIsUser1 = isUser1(input.senderId, match.user1_id, match.user2_id)

    const msgRows = await sql<DbMatchMessageRow[]>`
      INSERT INTO match_messages (match_id, sender_id, body)
      VALUES (${match.id}, ${input.senderId}, ${trimmed})
      RETURNING id, match_id, sender_id, body, created_at
    `
    const message = msgRows[0]
    if (!message) return { ok: false, code: "not_found" } as const

    const flags = {
      user1HasSent: match.user1_has_sent,
      user2HasSent: match.user2_has_sent,
    }
    if (senderIsUser1) flags.user1HasSent = true
    else flags.user2HasSent = true

    const statusAfter = nextStatusAfterSend(statusBefore, senderIsUser1, flags)

    const updatedRows = await sql<DbMatchRow[]>`
      UPDATE matches
      SET
        status = ${statusAfter},
        user1_has_sent = ${flags.user1HasSent},
        user2_has_sent = ${flags.user2HasSent}
      WHERE id = ${match.id}
      RETURNING
        id, user1_id, user2_id, created_at, expires_at, status,
        user1_has_sent, user2_has_sent, expired_at
    `
    const updated = updatedRows[0] ?? match

    return {
      ok: true,
      message: { id: message.id, createdAt: message.created_at.toISOString() },
      match: rowToDto(updated, input.senderId, like.peer_name),
      statusBefore,
      statusAfter,
    } as const
  })
}

export async function expireDueMatches(): Promise<ExpireMatchesResult> {
  const db = getDb()
  if (!db) return { expiredCount: 0, matchIds: [] }

  const now = new Date()

  const due = await db<{ id: string }[]>`
    SELECT id
    FROM matches
    WHERE status <> 'expired'
      AND expires_at <= ${now}
    FOR UPDATE SKIP LOCKED
  `

  if (!due.length) return { expiredCount: 0, matchIds: [] }

  const ids = due.map((r) => r.id)

  await db`
    UPDATE matches
    SET status = 'expired', expired_at = ${now}, urgency_level = 'expired'
    WHERE id = ANY(${ids})
  `

  await db`
    UPDATE likes
    SET is_expired = true
    WHERE match_id = ANY(${ids})
  `

  return { expiredCount: ids.length, matchIds: ids }
}

export async function markMatchExpired(matchId: string): Promise<void> {
  const db = getDb()
  if (!db) return

  const now = new Date()
  await db`
    UPDATE matches
    SET status = 'expired', expired_at = ${now}, urgency_level = 'expired'
    WHERE id = ${matchId}
  `
  await db`
    UPDATE likes SET is_expired = true WHERE match_id = ${matchId}
  `
}

/** Expire a match by likes row id (unmatch / close contact). */
export async function expireMatchByLikeId(
  likeId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; code: "not_found" | "forbidden" | "already_expired" }> {
  const ctx = await getMatchForUser(likeId, userId)
  if (!ctx) {
    const like = await findLikeContext(likeId, userId)
    if (!like) return { ok: false, code: "not_found" }
    return { ok: false, code: "not_found" }
  }

  if (ctx.match.status === "expired" || ctx.match.expires_at <= new Date()) {
    return { ok: false, code: "already_expired" }
  }

  await markMatchExpired(ctx.match.id)
  return { ok: true }
}

/** Ensure a likes row has a canonical engine match (lazy migration). */
export async function ensureEngineMatchForLike(likeId: string, userId: string): Promise<DbMatchRow | null> {
  const ctx = await findLikeContext(likeId, userId)
  if (!ctx) return null
  if (ctx.match_id) return getMatchById(ctx.match_id)

  const db = getDb()
  if (!db) return null

  const likeRows = await db<{ expires_at: Date | null; created_at: Date; to_user: string }[]>`
    SELECT expires_at, created_at, to_user FROM likes WHERE id = ${likeId} LIMIT 1
  `
  const like = likeRows[0]
  if (!like) return null

  const expiresAt = like.expires_at ?? matchExpiresAt(like.created_at)
  return createMatchForPair({
    userA: userId,
    userB: like.to_user,
    createdAt: like.created_at,
    expiresAt,
  })
}
