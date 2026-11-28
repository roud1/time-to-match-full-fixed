/**
 * Expired matches: restoring (Premium; admin accounts without limits) and "never expire" for
 * admin accounts.
 *
 * Only matches that ran out of TIME can be restored. A match someone closed (unmatch: expired
 * before its deadline) or a blocked pair stays closed — restoring would override that person's
 * decision.
 */

import { getDb } from "@/server/db"
import { isAdminUser } from "@/server/auth/admin"
import { primaryPhotoRefSql, toPublicPhotoUrl } from "@/server/photos/public-ref"
import { isPremium } from "@/server/monetization/subscription.service"

export const RESTORE_WINDOW_DAYS = 30
const RESTORED_HOURS = 24
/** Admin matches: practically never expire (the UI shows "∞" above a year). */
const ADMIN_EXPIRY_YEARS = 10

type Sql = NonNullable<ReturnType<typeof getDb>>

export type RestorableMatch = {
  matchId: string
  peerUserId: string
  peerName: string | null
  peerPhoto: string | null
  expiredAt: string
}

function adminExpiry(): Date {
  return new Date(Date.now() + ADMIN_EXPIRY_YEARS * 365 * 24 * 60 * 60 * 1000)
}

async function restorableRows(sql: Sql, userId: string, matchId?: string) {
  return sql<
    { id: string; peer_id: string; peer_name: string | null; peer_photo: string | null; expired_at: Date }[]
  >`
    SELECT m.id,
      CASE WHEN m.user1_id = ${userId} THEN m.user2_id ELSE m.user1_id END AS peer_id,
      peer.name AS peer_name,
      CASE WHEN EXISTS (SELECT 1 FROM blind_date_rooms r WHERE r.match_id = m.id AND r.reveal_level < 100) THEN NULL
        ELSE ${sql.unsafe(primaryPhotoRefSql("peer"))} END AS peer_photo,
      m.expired_at
    FROM matches m
    JOIN users peer ON peer.id = CASE WHEN m.user1_id = ${userId} THEN m.user2_id ELSE m.user1_id END
    WHERE (m.user1_id = ${userId} OR m.user2_id = ${userId})
      AND m.status = 'expired'
      AND m.expired_at IS NOT NULL
      AND m.expired_at > now() - (${RESTORE_WINDOW_DAYS} || ' days')::interval
      -- ran out of time (not closed early by someone)
      AND m.expired_at >= m.expires_at - interval '1 minute'
      AND peer.is_active AND NOT COALESCE(peer.is_blocked, false)
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks b
        WHERE (b.blocker_id = ${userId} AND b.blocked_id = peer.id) OR (b.blocker_id = peer.id AND b.blocked_id = ${userId})
      )
      ${matchId ? sql`AND m.id = ${matchId}` : sql``}
    ORDER BY m.expired_at DESC
    LIMIT 30
  `
}

export async function listRestorableMatches(userId: string): Promise<RestorableMatch[]> {
  const sql = getDb()
  if (!sql) return []
  const rows = await restorableRows(sql, userId)
  return rows.map((r) => ({
    matchId: r.id,
    peerUserId: r.peer_id,
    peerName: r.peer_name,
    peerPhoto: toPublicPhotoUrl(r.peer_id, 0, r.peer_photo),
    expiredAt: r.expired_at.toISOString(),
  }))
}

export type RestoreResult = { ok: true; expiresAt: string } | { ok: false; code: "not_found" | "premium_required" }

export async function restoreMatch(userId: string, matchId: string): Promise<RestoreResult> {
  const sql = getDb()
  if (!sql) return { ok: false, code: "not_found" }
  const [row] = await restorableRows(sql, userId, matchId)
  if (!row) return { ok: false, code: "not_found" }
  const admin = await isAdminUser(userId)
  if (!admin && !(await isPremium(userId))) return { ok: false, code: "premium_required" }

  const expiresAt = admin ? adminExpiry() : new Date(Date.now() + RESTORED_HOURS * 60 * 60 * 1000)
  const restored = await sql.begin(async (tx) => {
    const [m] = await tx<{ id: string }[]>`
      UPDATE matches SET
        status = CASE WHEN user1_has_sent AND user2_has_sent THEN 'active_chat'
                      WHEN user1_has_sent OR user2_has_sent THEN 'waiting_reply'
                      ELSE 'new_match' END,
        expires_at = ${expiresAt}, expired_at = NULL, urgency_level = 'normal'
      WHERE id = ${matchId} AND status = 'expired'
      RETURNING id
    `
    if (!m) return false
    await tx`UPDATE likes SET is_expired = false, expires_at = ${expiresAt} WHERE match_id = ${matchId}`
    return true
  })
  if (!restored) return { ok: false, code: "not_found" }

  const [me] = await sql<{ name: string | null }[]>`SELECT name FROM users WHERE id = ${userId}`
  const { pushToUser } = await import("@/server/push/notify")
  void pushToUser({ userId: row.peer_id, kind: "restored", peerUserId: userId, peerName: me?.name ?? null }).catch(() => null)
  return { ok: true, expiresAt: expiresAt.toISOString() }
}

/** Admin accounts: their open matches never run out (called when the match list is read). */
export async function keepAdminMatchesAlive(userId: string): Promise<void> {
  const sql = getDb()
  if (!sql || !(await isAdminUser(userId))) return
  const until = adminExpiry()
  const ids = await sql<{ id: string }[]>`
    UPDATE matches SET expires_at = ${until}, urgency_level = 'normal'
    WHERE (user1_id = ${userId} OR user2_id = ${userId})
      AND status <> 'expired'
      AND expires_at < now() + interval '365 days'
    RETURNING id
  `
  if (ids.length) {
    await sql`
      UPDATE likes SET expires_at = ${until}, is_expired = false
      WHERE match_id = ANY(${ids.map((r) => r.id)}::uuid[])
    `
  }
}

/** New matches with an admin account start with the long expiry. */
export async function adminMatchExpiry(userA: string, userB: string): Promise<Date | null> {
  if ((await isAdminUser(userA)) || (await isAdminUser(userB))) return adminExpiry()
  return null
}
