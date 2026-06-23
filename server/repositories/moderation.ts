import { getDb } from "@/server/db"

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

  await db`
    UPDATE matches m
    SET status = 'expired', expired_at = COALESCE(m.expired_at, now()), urgency_level = 'expired'
    FROM likes l
    WHERE l.match_id = m.id
      AND l.is_match = true
      AND m.status <> 'expired'
      AND (
        (l.from_user = ${blockerId} AND l.to_user = ${blockedId})
        OR (l.from_user = ${blockedId} AND l.to_user = ${blockerId})
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

export async function listPendingReports(limit = 50): Promise<
  {
    id: string
    reporterId: string
    reportedUserId: string
    reason: ReportReason
    comment: string | null
    status: string
    createdAt: Date
    reporterName: string | null
    reportedName: string | null
  }[]
> {
  const db = getDb()
  if (!db) return []

  const rows = await db<
    {
      id: string
      reporter_id: string
      reported_user_id: string
      reason: ReportReason
      comment: string | null
      status: string
      created_at: Date
      reporter_name: string | null
      reported_name: string | null
    }[]
  >`
    SELECT
      r.id,
      r.reporter_id,
      r.reported_user_id,
      r.reason,
      r.comment,
      r.status,
      r.created_at,
      reporter.name AS reporter_name,
      reported.name AS reported_name
    FROM reports r
    LEFT JOIN users reporter ON reporter.id = r.reporter_id
    LEFT JOIN users reported ON reported.id = r.reported_user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
    LIMIT ${limit}
  `

  return rows.map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    reportedUserId: r.reported_user_id,
    reason: r.reason,
    comment: r.comment,
    status: r.status,
    createdAt: r.created_at,
    reporterName: r.reporter_name,
    reportedName: r.reported_name,
  }))
}

export async function reviewReport(input: {
  reportId: string
  status: "reviewed" | "dismissed"
}): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  const rows = await db<{ id: string }[]>`
    UPDATE reports
    SET status = ${input.status}
    WHERE id = ${input.reportId} AND status = 'pending'
    RETURNING id
  `
  return rows.length > 0
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
