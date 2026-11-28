import { getDb } from "@/server/db"
import { selfieEndpoint } from "@/server/verification/upload"
import { primaryPhotoRefSql, toPublicPhotoUrl } from "@/server/photos/public-ref"
import type {
  VerificationRequest,
  VerificationRequestStatus,
  VerificationStatusResponse,
} from "@/client/lib/verification/types"

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
    // Never the stored image itself: an admin-only endpoint serves it.
    selfieUrl: selfieEndpoint(row.id),
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

export type PendingVerificationItem = {
  id: string
  userId: string
  userName: string | null
  gesture: string
  createdAt: string
  selfieUrl: string
  /** The profile photo the selfie is compared with (null: no photo). */
  profilePhotoUrl: string | null
}

/** Moderation queue: pending photo verifications, oldest first. */
export async function listPendingVerificationRequests(limit = 50): Promise<PendingVerificationItem[]> {
  const db = getDb()
  if (!db) return []
  const rows = await db<
    { id: string; user_id: string; name: string | null; gesture: string; created_at: Date; photo_ref: string | null }[]
  >`
    SELECT r.id, r.user_id, u.name, r.gesture, r.created_at,
      ${db.unsafe(primaryPhotoRefSql("u"))} AS photo_ref
    FROM verification_requests r
    JOIN users u ON u.id = r.user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
    LIMIT ${limit}
  `
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.name,
    gesture: r.gesture,
    createdAt: r.created_at.toISOString(),
    selfieUrl: selfieEndpoint(r.id),
    profilePhotoUrl: toPublicPhotoUrl(r.user_id, 0, r.photo_ref),
  }))
}

/** The stored selfie value (data URL, or a legacy /uploads path). */
export async function findVerificationSelfie(id: string): Promise<string | null> {
  const db = getDb()
  if (!db) return null
  const rows = await db<{ selfie_url: string }[]>`SELECT selfie_url FROM verification_requests WHERE id = ${id} LIMIT 1`
  return rows[0]?.selfie_url ?? null
}
