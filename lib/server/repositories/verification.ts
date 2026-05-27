import { getDb } from "@/lib/server/db"
import type {
  VerificationRequest,
  VerificationRequestStatus,
  VerificationStatusResponse,
} from "@/lib/verification/types"

type RequestRow = {
  id: string
  user_id: string
  gesture: string
  selfie_url: string
  status: VerificationRequestStatus
  admin_notes: string | null
  created_at: Date
  reviewed_at: Date | null
}

function mapRow(row: RequestRow): VerificationRequest {
  return {
    id: row.id,
    userId: row.user_id,
    gesture: row.gesture,
    selfieUrl: row.selfie_url,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at.toISOString(),
    reviewedAt: row.reviewed_at?.toISOString() ?? null,
  }
}

export async function getUserPhotoVerified(userId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db<{ photo_verified: boolean }[]>`
    SELECT photo_verified FROM users WHERE id = ${userId} LIMIT 1
  `
  return rows[0]?.photo_verified ?? false
}

export async function getVerificationStatus(userId: string): Promise<VerificationStatusResponse> {
  const verified = await getUserPhotoVerified(userId)
  if (verified) {
    return { verified: true, requestStatus: "approved" }
  }

  const db = getDb()
  if (!db) return { verified: false, requestStatus: "none" }

  const rows = await db<{ status: VerificationRequestStatus }[]>`
    SELECT status FROM verification_requests
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `
  const latest = rows[0]?.status
  if (!latest) return { verified: false, requestStatus: "none" }
  if (latest === "pending") return { verified: false, requestStatus: "pending" }
  if (latest === "rejected") return { verified: false, requestStatus: "rejected" }
  return { verified: false, requestStatus: "none" }
}

export async function hasPendingVerificationRequest(userId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db<{ id: string }[]>`
    SELECT id FROM verification_requests
    WHERE user_id = ${userId} AND status = 'pending'
    LIMIT 1
  `
  return rows.length > 0
}

export async function createVerificationRequest(input: {
  userId: string
  gesture: string
  selfieUrl: string
}): Promise<VerificationRequest | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<RequestRow[]>`
    INSERT INTO verification_requests (user_id, gesture, selfie_url, status)
    VALUES (${input.userId}, ${input.gesture}, ${input.selfieUrl}, 'pending')
    RETURNING id, user_id, gesture, selfie_url, status, admin_notes, created_at, reviewed_at
  `
  return rows[0] ? mapRow(rows[0]) : null
}

export async function findVerificationRequestById(id: string): Promise<VerificationRequest | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<RequestRow[]>`
    SELECT id, user_id, gesture, selfie_url, status, admin_notes, created_at, reviewed_at
    FROM verification_requests
    WHERE id = ${id}
    LIMIT 1
  `
  return rows[0] ? mapRow(rows[0]) : null
}

export async function reviewVerificationRequest(input: {
  id: string
  status: "approved" | "rejected"
  adminNotes?: string | null
}): Promise<VerificationRequest | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<RequestRow[]>`
    UPDATE verification_requests
    SET
      status = ${input.status},
      admin_notes = ${input.adminNotes ?? null},
      reviewed_at = now()
    WHERE id = ${input.id}
    RETURNING id, user_id, gesture, selfie_url, status, admin_notes, created_at, reviewed_at
  `
  const row = rows[0]
  if (!row) return null

  if (input.status === "approved") {
    await db`
      UPDATE users SET photo_verified = true WHERE id = ${row.user_id}
    `
  }

  return mapRow(row)
}
