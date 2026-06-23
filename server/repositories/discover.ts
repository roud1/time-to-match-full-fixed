import type { DiscoverFilters, DiscoverProfile } from "@/client/lib/discover/types"
import { matchingService } from "@/server/matching"
import { getDb } from "@/server/db"

export async function listDiscoverProfiles(input: {
  viewerId: string
  filters: DiscoverFilters
  viewerLat?: number | null
  viewerLng?: number | null
}): Promise<DiscoverProfile[]> {
  return matchingService.getDiscoverFeed({
    viewerId: input.viewerId,
    filters: input.filters,
    viewerLat: input.viewerLat,
    viewerLng: input.viewerLng,
  })
}

export async function updateUserDiscoveryFields(
  userId: string,
  patch: {
    purpose?: string | null
    gender?: "male" | "female" | null
    ageMin?: number | null
    ageMax?: number | null
    latitude?: number | null
    longitude?: number | null
    maxDistance?: number
    profile?: Record<string, unknown>
    isActive?: boolean
  }
): Promise<boolean> {
  const db = getDb()
  if (!db) return false

  if (patch.purpose !== undefined) {
    await db`
      UPDATE users SET purpose = ${patch.purpose} WHERE id = ${userId}
    `
  }
  if (patch.gender !== undefined) {
    await db`
      UPDATE users SET gender = ${patch.gender} WHERE id = ${userId}
    `
  }
  if (patch.ageMin !== undefined) {
    await db`
      UPDATE users SET age_min = ${patch.ageMin} WHERE id = ${userId}
    `
  }
  if (patch.ageMax !== undefined) {
    await db`
      UPDATE users SET age_max = ${patch.ageMax} WHERE id = ${userId}
    `
  }
  if (patch.latitude !== undefined || patch.longitude !== undefined) {
    await db`
      UPDATE users
      SET
        latitude = ${patch.latitude ?? null},
        longitude = ${patch.longitude ?? null}
      WHERE id = ${userId}
    `
  }
  if (patch.maxDistance !== undefined) {
    await db`
      UPDATE users SET max_distance = ${patch.maxDistance} WHERE id = ${userId}
    `
  }
  if (patch.profile !== undefined) {
    await db`
      UPDATE users SET profile = ${db.json(JSON.parse(JSON.stringify(patch.profile)))} WHERE id = ${userId}
    `
  }
  if (patch.isActive !== undefined) {
    await db`
      UPDATE users SET is_active = ${patch.isActive} WHERE id = ${userId}
    `
  }

  return true
}

export async function getUserDiscoveryFields(userId: string) {
  const db = getDb()
  if (!db) return null
  const rows = await db<
    {
      purpose: string | null
      gender: "male" | "female" | null
      age_min: number | null
      age_max: number | null
      latitude: number | null
      longitude: number | null
      max_distance: number
      profile: Record<string, unknown>
    }[]
  >`
    SELECT purpose, gender, age_min, age_max, latitude, longitude, max_distance, profile
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}
