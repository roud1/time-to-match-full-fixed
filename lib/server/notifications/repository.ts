import { getDb } from "@/lib/server/db"
import type {
  DbNotificationRow,
  NotificationInboxItem,
  NotificationType,
} from "@/lib/server/notifications/types"
import type { PushSubscriptionJson } from "@/lib/server/push/types"

export type PendingNotificationRow = DbNotificationRow & {
  email: string
  email_verified: boolean
  push_subscription: PushSubscriptionJson | null
  peer_name: string | null
}

export async function listUnreadInbox(userId: string): Promise<NotificationInboxItem[]> {
  const db = getDb()
  if (!db) return []

  const rows = await db<
    (DbNotificationRow & { peer_name: string | null })[]
  >`
    SELECT
      n.id,
      n.user_id,
      n.type,
      n.reference_id,
      n.lead_hours,
      n.scheduled_for,
      n.sent,
      n.read,
      n.sent_at,
      n.created_at,
      peer.name AS peer_name
    FROM notifications n
    LEFT JOIN users peer ON peer.id = n.reference_id
    WHERE n.user_id = ${userId}
      AND n.sent = true
      AND n.read = false
    ORDER BY n.created_at DESC
    LIMIT 50
  `

  return rows.map(inboxRowToItem)
}

function inboxRowToItem(
  row: DbNotificationRow & { peer_name: string | null }
): NotificationInboxItem {
  return {
    id: row.id,
    type: row.type,
    referenceId: row.reference_id,
    leadHours: row.lead_hours,
    peerName: row.peer_name,
    scheduledFor: row.scheduled_for.toISOString(),
    sentAt: row.sent_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    href:
      row.type === "profile_expiring"
        ? "/profile"
        : row.reference_id
          ? `/app?tab=chat&with=${row.reference_id}`
          : "/app?tab=chat",
  }
}

export async function markAllRead(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ id: string }[]>`
    UPDATE notifications
    SET read = true
    WHERE user_id = ${userId} AND read = false
    RETURNING id
  `
  return rows.length
}

export async function countUnread(userId: string): Promise<number> {
  const db = getDb()
  if (!db) return 0
  const rows = await db<{ count: string }[]>`
    SELECT COUNT(*)::text AS count
    FROM notifications
    WHERE user_id = ${userId} AND sent = true AND read = false
  `
  return Number.parseInt(rows[0]?.count ?? "0", 10)
}

export type ScheduleResult = {
  profileScheduled: number
  matchScheduled: number
}

export async function scheduleExpiryNotifications(): Promise<ScheduleResult> {
  const db = getDb()
  if (!db) return { profileScheduled: 0, matchScheduled: 0 }

  let profileScheduled = 0
  let matchScheduled = 0

  for (const lead of [12, 6, 1]) {
    const inserted = await db<{ id: string }[]>`
      INSERT INTO notifications (user_id, type, reference_id, lead_hours, scheduled_for)
      SELECT
        u.id,
        'profile_expiring',
        NULL,
        ${lead},
        GREATEST(now(), u.profile_expires_at - (${lead} || ' hours')::interval)
      FROM users u
      WHERE u.profile_expires_at IS NOT NULL
        AND u.profile_expires_at > now()
        AND u.profile_expires_at - (${lead} || ' hours')::interval <= now()
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = u.id
            AND n.type = 'profile_expiring'
            AND n.lead_hours = ${lead}
        )
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    profileScheduled += inserted.length
  }

  for (const lead of [6, 1]) {
    const insertedFrom = await db<{ id: string }[]>`
      INSERT INTO notifications (user_id, type, reference_id, lead_hours, scheduled_for)
      SELECT
        l.from_user,
        'match_expiring',
        l.to_user,
        ${lead},
        GREATEST(now(), l.expires_at - (${lead} || ' hours')::interval)
      FROM likes l
      WHERE l.is_match = true
        AND l.is_expired = false
        AND l.expires_at IS NOT NULL
        AND l.expires_at > now()
        AND l.expires_at - (${lead} || ' hours')::interval <= now()
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = l.from_user
            AND n.type = 'match_expiring'
            AND n.reference_id = l.to_user
            AND n.lead_hours = ${lead}
        )
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    matchScheduled += insertedFrom.length

    const insertedTo = await db<{ id: string }[]>`
      INSERT INTO notifications (user_id, type, reference_id, lead_hours, scheduled_for)
      SELECT
        l.to_user,
        'match_expiring',
        l.from_user,
        ${lead},
        GREATEST(now(), l.expires_at - (${lead} || ' hours')::interval)
      FROM likes l
      WHERE l.is_match = true
        AND l.is_expired = false
        AND l.expires_at IS NOT NULL
        AND l.expires_at > now()
        AND l.expires_at - (${lead} || ' hours')::interval <= now()
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = l.to_user
            AND n.type = 'match_expiring'
            AND n.reference_id = l.from_user
            AND n.lead_hours = ${lead}
        )
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    matchScheduled += insertedTo.length
  }

  return { profileScheduled, matchScheduled }
}

export async function fetchPendingForDelivery(limit = 200): Promise<PendingNotificationRow[]> {
  const db = getDb()
  if (!db) return []

  const rows = await db<
    (DbNotificationRow & {
      email: string
      email_verified: boolean
      push_subscription: PushSubscriptionJson | null
      peer_name: string | null
    })[]
  >`
    SELECT
      n.id,
      n.user_id,
      n.type,
      n.reference_id,
      n.lead_hours,
      n.scheduled_for,
      n.sent,
      n.read,
      n.sent_at,
      n.created_at,
      u.email,
      u.email_verified,
      u.push_subscription,
      peer.name AS peer_name
    FROM notifications n
    INNER JOIN users u ON u.id = n.user_id
    LEFT JOIN users peer ON peer.id = n.reference_id
    WHERE n.sent = false
      AND n.scheduled_for <= now()
    ORDER BY n.scheduled_for ASC
    LIMIT ${limit}
  `

  return rows.map((r) => ({
    ...r,
    type: r.type as NotificationType,
    push_subscription: r.push_subscription,
  }))
}

export async function markNotificationSent(id: string): Promise<void> {
  const db = getDb()
  if (!db) return
  await db`
    UPDATE notifications
    SET sent = true, sent_at = now()
    WHERE id = ${id}
  `
}
