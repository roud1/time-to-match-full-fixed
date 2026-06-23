import { getDb } from "@/server/db"
import { URGENCY_HOURS, type MatchUrgencyLevel } from "@/server/engines/types"
import { log } from "@/server/log"

export type UrgencyTickResult = {
  lowVisibility: number
  warnings: number
  critical: number
  notificationsScheduled: number
}

function hoursSince(date: Date, now: Date): number {
  return (now.getTime() - date.getTime()) / (60 * 60 * 1000)
}

function targetUrgency(createdAt: Date, status: string, now: Date): MatchUrgencyLevel {
  if (status === "expired") return "expired"
  const h = hoursSince(createdAt, now)
  if (h >= 24) return "expired"
  if (h >= URGENCY_HOURS.critical) return "critical"
  if (h >= URGENCY_HOURS.warning) return "warning"
  if (h >= URGENCY_HOURS.lowVisibility && (status === "new_match" || status === "waiting_reply")) {
    return "low_visibility"
  }
  return "normal"
}

/** Advance urgency levels + deprioritize ghosts (6h / 12h / 23h ladder). */
export async function processMatchUrgency(): Promise<UrgencyTickResult> {
  const db = getDb()
  if (!db) return { lowVisibility: 0, warnings: 0, critical: 0, notificationsScheduled: 0 }

  const now = new Date()
  const result: UrgencyTickResult = {
    lowVisibility: 0,
    warnings: 0,
    critical: 0,
    notificationsScheduled: 0,
  }

  const active = await db<
    {
      id: string
      created_at: Date
      status: string
      urgency_level: MatchUrgencyLevel
      non_responder_id: string | null
      user1_id: string
      user2_id: string
    }[]
  >`
    SELECT id, created_at, status, urgency_level, non_responder_id, user1_id, user2_id
    FROM matches
    WHERE status <> 'expired'
      AND expires_at > now()
    FOR UPDATE SKIP LOCKED
  `

  for (const m of active) {
    const next = targetUrgency(m.created_at, m.status, now)
    if (next === m.urgency_level) continue

    await db`
      UPDATE matches
      SET urgency_level = ${next}, urgency_updated_at = ${now}
      WHERE id = ${m.id}
    `

    if (next === "low_visibility") {
      result.lowVisibility += 1
      if (m.non_responder_id) {
        await db`
          UPDATE users SET discover_visibility = LEAST(discover_visibility, 0.4)
          WHERE id = ${m.non_responder_id}
        `
      }
    }

    if (next === "warning") {
      result.warnings += 1
      if (m.non_responder_id) {
        const scheduled = await scheduleUrgencyNotification({
          userId: m.non_responder_id,
          peerId: m.non_responder_id === m.user1_id ? m.user2_id : m.user1_id,
          leadHours: 12,
        })
        if (scheduled) result.notificationsScheduled += 1
      }
    }

    if (next === "critical") {
      result.critical += 1
      if (m.non_responder_id) {
        const scheduled = await scheduleUrgencyNotification({
          userId: m.non_responder_id,
          peerId: m.non_responder_id === m.user1_id ? m.user2_id : m.user1_id,
          leadHours: 1,
        })
        if (scheduled) result.notificationsScheduled += 1
      }
    }
  }

  if (result.lowVisibility || result.warnings || result.critical) {
    log.info("expiration_urgency_tick", result)
  }

  return result
}

async function scheduleUrgencyNotification(input: {
  userId: string
  peerId: string
  leadHours: number
}): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ id: string }[]>`
    INSERT INTO notifications (user_id, type, reference_id, lead_hours, scheduled_for)
    VALUES (
      ${input.userId},
      'match_urgency_warning',
      ${input.peerId},
      ${input.leadHours},
      now()
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `
  return rows.length > 0
}

/** Set non-responder when first message lands. */
export async function onFirstMessage(input: {
  matchId: string
  senderId: string
  user1Id: string
  user2Id: string
}): Promise<void> {
  const db = getDb()
  if (!db) return

  const peerId = input.senderId === input.user1Id ? input.user2Id : input.user1Id

  await db`
    UPDATE matches
    SET
      first_message_at = COALESCE(first_message_at, now()),
      non_responder_id = ${peerId},
      urgency_level = CASE WHEN urgency_level = 'expired' THEN urgency_level ELSE 'normal' END
    WHERE id = ${input.matchId}
  `
}

/** Clear ghost flag when both sides participated. */
export async function onActiveChat(matchId: string): Promise<void> {
  const db = getDb()
  if (!db) return

  await db`
    UPDATE matches
    SET
      non_responder_id = NULL,
      urgency_level = 'normal',
      urgency_updated_at = now()
    WHERE id = ${matchId}
  `
}
