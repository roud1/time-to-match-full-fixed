import { distanceKm } from "@/client/lib/geo"
import { getDb } from "@/server/db"
import type { CommonInterest } from "@/client/lib/interests/types"
import type { DiscoverFilters } from "@/client/lib/discover/types"
import type { CandidateProfile } from "@/server/matching/types"
import { getInterestIdsByUser, getInterestsForUsers } from "@/server/repositories/interests"

type DiscoverCandidateRow = {
  id: string
  name: string
  profile: Record<string, unknown>
  purpose: string | null
  gender: string | null
  latitude: number | null
  longitude: number | null
  photo_verified: boolean
  last_active_at: Date | null
  activity_score: number
  last_seen_at: Date | null
}

export type ActivitySignals = {
  profileCompleteness: number
  activitySignal: number
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

export function computeProfileCompleteness(profile: Record<string, unknown>, interestCount: number): number {
  let score = 0
  if (readString(profile.bio)) score += 0.35
  const photos = readPhotos(profile)
  if (photos.length > 0 && photos[0] !== "/placeholder-profile.jpg") score += 0.35
  if (interestCount >= 3) score += 0.3
  else if (interestCount > 0) score += 0.15
  return Math.min(1, score)
}

export function computeActivitySignal(input: {
  lastActiveAt: Date | null
  lastSeenAt: Date | null
  activityScore: number
  recentSwipes: number
}): number {
  const last = input.lastActiveAt ?? input.lastSeenAt
  let recency = 0.35
  if (last) {
    const hours = (Date.now() - last.getTime()) / (1000 * 60 * 60)
    if (hours <= 1) recency = 1
    else if (hours <= 24) recency = 0.85
    else if (hours <= 72) recency = 0.6
    else if (hours <= 168) recency = 0.4
    else recency = 0.2
  }

  const behavior = Math.min(1, Math.max(0, input.activityScore))
  const swipeBoost = Math.min(0.2, input.recentSwipes / 50)

  return Math.min(1, recency * 0.55 + behavior * 0.35 + swipeBoost)
}

export async function touchUserActivity(userId: string): Promise<void> {
  const db = getDb()
  if (!db) return
  await db`
    UPDATE users SET last_active_at = now() WHERE id = ${userId}
  `
}

export async function listEligibleCandidates(input: {
  viewerId: string
  filters: DiscoverFilters
}): Promise<DiscoverCandidateRow[]> {
  const db = getDb()
  if (!db) return []

  return db<DiscoverCandidateRow[]>`
    SELECT
      u.id,
      u.name,
      u.profile,
      u.purpose,
      u.gender,
      u.latitude,
      u.longitude,
      u.photo_verified,
      u.last_active_at,
      u.activity_score,
      up.last_seen_at
    FROM users u
    LEFT JOIN user_presence up ON up.user_id = u.id
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
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks b
        WHERE (b.blocker_id = ${input.viewerId} AND b.blocked_id = u.id)
           OR (b.blocker_id = u.id AND b.blocked_id = ${input.viewerId})
      )
    LIMIT 120
  `
}

export async function getRecentSwipeCounts(userIds: string[]): Promise<Map<string, number>> {
  const db = getDb()
  const result = new Map<string, number>()
  if (!db || userIds.length === 0) return result

  const rows = await db<{ user_id: string; swipe_count: number }[]>`
    SELECT user_id, COUNT(*)::int AS swipe_count
    FROM (
      SELECT from_user AS user_id FROM likes
      WHERE from_user = ANY(${userIds}) AND created_at > now() - interval '7 days'
      UNION ALL
      SELECT from_user AS user_id FROM discover_passes
      WHERE from_user = ANY(${userIds}) AND created_at > now() - interval '7 days'
    ) s
    GROUP BY user_id
  `

  for (const row of rows) result.set(row.user_id, row.swipe_count)
  return result
}

export async function buildCandidateProfiles(input: {
  viewerId: string
  filters: DiscoverFilters
  viewerLat?: number | null
  viewerLng?: number | null
}): Promise<Array<CandidateProfile & ActivitySignals>> {
  const rows = await listEligibleCandidates({ viewerId: input.viewerId, filters: input.filters })
  if (rows.length === 0) return []

  const viewerInterestMap = await getInterestsForUsers([input.viewerId])
  const viewerInterestRows = viewerInterestMap.get(input.viewerId) ?? []
  const interestByUser = await getInterestsForUsers(rows.map((r) => r.id))
  const swipeCounts = await getRecentSwipeCounts(rows.map((r) => r.id))

  const viewerPos =
    input.viewerLat != null &&
    input.viewerLng != null &&
    Number.isFinite(input.viewerLat) &&
    Number.isFinite(input.viewerLng)
      ? { lat: input.viewerLat, lng: input.viewerLng }
      : null

  const maxDistance = input.filters.maxDistance
  const result: Array<CandidateProfile & ActivitySignals> = []

  for (const row of rows) {
    const profile = row.profile ?? {}
    const gender = readGender(profile, row.gender)
    const age = readAge(profile)

    if (input.filters.gender && gender !== input.filters.gender) continue
    if (input.filters.purpose && row.purpose !== input.filters.purpose) continue
    const minAge = input.filters.ageMin ?? input.filters.minAge
    const maxAge = input.filters.ageMax ?? input.filters.maxAge
    if (minAge != null && age < minAge) continue
    if (maxAge != null && age > maxAge) continue

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

    const candidateRows = interestByUser.get(row.id) ?? []
    const common = commonBetween(viewerInterestRows, candidateRows)
    const photos = readPhotos(profile)
    const bio = readString(profile.bio) ?? ""
    const interestIds = candidateRows.map((r) => r.id)
    const profileCompleteness = computeProfileCompleteness(profile, interestIds.length)
    const activitySignal = computeActivitySignal({
      lastActiveAt: row.last_active_at,
      lastSeenAt: row.last_seen_at,
      activityScore: row.activity_score,
      recentSwipes: swipeCounts.get(row.id) ?? 0,
    })

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
      interestIds,
      lat: row.latitude,
      lng: row.longitude,
      purpose: row.purpose,
      commonInterests: common.slice(0, 5),
      photoVerified: row.photo_verified ?? false,
      profileCompleteness,
      activitySignal,
    })
  }

  return result
}

export async function getViewerInterestIds(viewerId: string): Promise<number[]> {
  return getInterestIdsByUser(viewerId)
}
