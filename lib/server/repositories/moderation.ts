import { getDb } from "@/lib/server/db"

export type ReportReason =
  | "harassment"
  | "spam"
  | "fake"
  | "inappropriate"
  | "other"

const REASON_MAP: Record<string, ReportReason> = {
  trustReportHarassment: "harassment",
  trustReportSpam: "spam",
  trustReportFake: "fake",
  trustReportInappropriate: "inappropriate",
  trustReportOther: "other",
}

export function mapReportReasonKey(reasonKey: string): ReportReason {
  return REASON_MAP[reasonKey] ?? "other"
}

export async function submitUserReport(input: {
  reporterId: string
  reportedUserId: string
  reasonKey: string
  comment?: string | null
}): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  if (input.reporterId === input.reportedUserId) return false

  const reason = mapReportReasonKey(input.reasonKey)
  await db`
    INSERT INTO reports (reporter_id, reported_user_id, reason, comment, status)
    VALUES (${input.reporterId}, ${input.reportedUserId}, ${reason}, ${input.comment ?? null}, 'pending')
  `
  return true
}

export async function blockUserPair(blockerId: string, blockedId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  if (blockerId === blockedId) return false

  await db`
    INSERT INTO user_blocks (blocker_id, blocked_id)
    VALUES (${blockerId}, ${blockedId})
    ON CONFLICT DO NOTHING
  `

  await db`
    UPDATE likes
    SET is_expired = true
    WHERE is_match = true
      AND is_expired = false
      AND (
        (from_user = ${blockerId} AND to_user = ${blockedId})
        OR (from_user = ${blockedId} AND to_user = ${blockerId})
      )
  `

  return true
}

export async function unblockUserPair(blockerId: string, blockedId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ blocker_id: string }[]>`
    DELETE FROM user_blocks
    WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
    RETURNING blocker_id
  `
  return rows.length > 0
}

export async function listBlockedUserIds(viewerId: string): Promise<string[]> {
  const db = getDb()
  if (!db) return []

  const rows = await db<{ blocked_id: string }[]>`
    SELECT blocked_id FROM user_blocks WHERE blocker_id = ${viewerId}
  `
  return rows.map((r) => r.blocked_id)
}

export async function isEitherBlocked(userA: string, userB: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ one: number }[]>`
    SELECT 1 AS one FROM user_blocks
    WHERE (blocker_id = ${userA} AND blocked_id = ${userB})
       OR (blocker_id = ${userB} AND blocked_id = ${userA})
    LIMIT 1
  `
  return rows.length > 0
}
