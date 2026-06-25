import { getDb } from "@/server/db"

/** Hours added to profile visibility on each activity sync. */
export const PROFILE_LIFE_HOURS = 72

export type ProfileActivitySync = {
  profileExpiresAt: string
  lastActiveAt: string
}

export async function syncProfileActivity(userId: string): Promise<ProfileActivitySync | null> {
  const db = getDb()
  if (!db) return null

  const rows = await db<{ profile_expires_at: Date; last_active_at: Date }[]>`
    UPDATE users
    SET
      last_active_at = now(),
      profile_expires_at = now() + (${PROFILE_LIFE_HOURS} || ' hours')::interval
    WHERE id = ${userId}
    RETURNING profile_expires_at, last_active_at
  `

  const row = rows[0]
  if (!row) return null

  return {
    profileExpiresAt: row.profile_expires_at.toISOString(),
    lastActiveAt: row.last_active_at.toISOString(),
  }
}

export function defaultProfileExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + PROFILE_LIFE_HOURS * 60 * 60 * 1000)
}
