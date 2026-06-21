import { getDb } from "@/lib/server/db"
import { distanceKm } from "@/lib/geo"
import type { DiscoverFilters, DiscoverProfile } from "@/lib/discover/types"
import type { CommonInterest } from "@/lib/interests/types"
import { interestCompatibilityPercent } from "@/lib/server/discover/compatibility"
import {
  applyVisibilityCap,
  rankDiscoverProfiles,
} from "@/lib/server/engines/ranking/ranking.service"
import { getBehaviorUser } from "@/lib/server/engines/behavior/repository"
import { getInterestIdsByUser, getInterestsForUsers } from "@/lib/server/repositories/interests"

type DiscoverCandidateRow = {
  id: string
  name: string
  profile: Record<string, unknown>
  purpose: string | null
  gender: string | null
  latitude: number | null
  longitude: number | null
  photo_verified: boolean
}

function readString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined
}

function readGender(profile: Record<string, unknown>, rowGender?: string | null): "male" | "female" {
  if (rowGender === "male" || rowGender === "female") return rowGender
  const g = readString(profile.gender)
  if (g === "male" || g === "female") return g
  return "female"
}

function readAge(profile: Record<string, unknown>): number {
  const birthdate = readString(profile.birthdate)
  if (!birthdate) return 25
  const birth = new Date(birthdate)
  if (Number.isNaN(birth.getTime())) return 25
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 18 && age <= 99 ? age : 25
}

function readPhotos(profile: Record<string, unknown>): string[] {
  const urls = profile.photoUrls
  if (Array.isArray(urls)) {
    const list = urls.filter((u): u is string => typeof u === "string" && u.length > 0)
    if (list.length) return list
  }
  const single = readString(profile.photoUrl)
  if (single) return [single]
  return ["/placeholder-profile.jpg"]
}

function readLocation(profile: Record<string, unknown>): string {
  const custom = readString(profile.customCity)
  if (custom) return custom
  const cityId = readString(profile.cityId)
  if (cityId) return cityId
  return "—"
}

function commonBetween(
  viewerRows: { id: number; name: string; emoji: string | null }[],
  candidateRows: { id: number; name: string; emoji: string | null }[]
): CommonInterest[] {
  const candidateIds = new Set(candidateRows.map((r) => r.id))
  return viewerRows
    .filter((r) => candidateIds.has(r.id))
    .map((r) => ({ id: r.id, name: r.name, emoji: r.emoji }))
}

export async function listDiscoverProfiles(input: {
  viewerId: string
  filters: DiscoverFilters
  viewerLat?: number | null
  viewerLng?: number | null
}): Promise<DiscoverProfile[]> {
  const db = getDb()
  if (!db) return []

  const viewerInterestIds = await getInterestIdsByUser(input.viewerId)
  const viewerInterestMap = await getInterestsForUsers([input.viewerId])
  const viewerInterestRows = viewerInterestMap.get(input.viewerId) ?? []

  const rows = await db<DiscoverCandidateRow[]>`
    SELECT u.id, u.name, u.profile, u.purpose, u.gender, u.latitude, u.longitude, u.photo_verified
    FROM users u
    WHERE u.id <> ${input.viewerId}
      AND u.is_active = true
      AND COALESCE(u.is_blocked, false) = false
      AND u.profile_expires_at IS NOT NULL
      AND u.profile_expires_at > now()
      AND NOT EXISTS (
        SELECT 1 FROM likes l
        WHERE l.from_user = ${input.viewerId} AND l.to_user = u.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM discover_passes p
        WHERE p.from_user = ${input.viewerId} AND p.to_user = u.id
      )
    LIMIT 120
  `

  if (rows.length === 0) return []

  const interestByUser = await getInterestsForUsers(rows.map((r) => r.id))

  const viewerPos =
    input.viewerLat != null &&
    input.viewerLng != null &&
    Number.isFinite(input.viewerLat) &&
    Number.isFinite(input.viewerLng)
      ? { lat: input.viewerLat, lng: input.viewerLng }
      : null

  const maxDistance = input.filters.maxDistance

  const result: DiscoverProfile[] = []

  for (const row of rows) {
    const profile = row.profile ?? {}
    const gender = readGender(profile)
    const age = readAge(profile)

    if (input.filters.gender && gender !== input.filters.gender) continue
    if (input.filters.purpose && row.purpose !== input.filters.purpose) continue
    const minAge = input.filters.ageMin ?? input.filters.minAge
    const maxAge = input.filters.ageMax ?? input.filters.maxAge
    if (minAge != null && age < minAge) continue
    if (maxAge != null && age > maxAge) continue

    const candidateRows = interestByUser.get(row.id) ?? []
    const common = commonBetween(viewerInterestRows, candidateRows)
    const compatibility = interestCompatibilityPercent(
      viewerInterestIds,
      candidateRows.map((r) => r.id),
      common
    )

    let distanceKmVal: number | null = null
    if (
      viewerPos &&
      row.latitude != null &&
      row.longitude != null &&
      Number.isFinite(row.latitude) &&
      Number.isFinite(row.longitude)
    ) {
      distanceKmVal = distanceKm(viewerPos, { lat: row.latitude, lng: row.longitude })
      if (maxDistance != null && distanceKmVal > maxDistance) continue
    }

    const photos = readPhotos(profile)
    const bio = readString(profile.bio) ?? ""

    result.push({
      id: row.id,
      name: row.name,
      age,
      gender,
      bio,
      location: readLocation(profile),
      distanceKm: distanceKmVal,
      image: photos[0],
      images: photos,
      interests: candidateRows.map((r) => r.name),
      lat: row.latitude,
      lng: row.longitude,
      purpose: row.purpose,
      compatibility,
      commonInterests: common.slice(0, 5),
      photoVerified: row.photo_verified ?? false,
    })
  }

  const ranked = await rankDiscoverProfiles({ viewerId: input.viewerId, profiles: result })
  const viewer = await getBehaviorUser(input.viewerId)
  return applyVisibilityCap(ranked, viewer?.discover_visibility ?? 1)
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
