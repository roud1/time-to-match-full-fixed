import { distanceKm } from "@/client/lib/geo"
import type {
  CandidateProfile,
  CompatibilityBreakdown,
  CompatibilityScore,
  ScoredCandidate,
  UserProfile,
} from "@/server/matching/types"

const WEIGHTS = {
  interests: 0.4,
  age: 0.2,
  geo: 0.25,
  activity: 0.15,
} as const

/** Jaccard similarity on interest tag IDs, scaled 0–100. */
export function scoreInterests(viewerIds: number[], candidateIds: number[]): number {
  if (viewerIds.length === 0 && candidateIds.length === 0) return 50
  const viewerSet = new Set(viewerIds)
  const candidateSet = new Set(candidateIds)
  let intersection = 0
  for (const id of viewerSet) {
    if (candidateSet.has(id)) intersection++
  }
  const union = new Set([...viewerIds, ...candidateIds]).size
  if (union === 0) return 0
  return Math.round((intersection / union) * 100)
}

/** Age fit: 100 inside preferred range, linear penalty outside. */
export function scoreAge(
  candidateAge: number,
  ageMin: number | null,
  ageMax: number | null
): number {
  const min = ageMin ?? 18
  const max = ageMax ?? 99
  if (candidateAge >= min && candidateAge <= max) return 100
  const distance = candidateAge < min ? min - candidateAge : candidateAge - max
  return Math.max(0, Math.round(100 - distance * 12))
}

/** Haversine distance: closer candidates score higher (0–100). */
export function scoreGeo(
  viewer: Pick<UserProfile, "latitude" | "longitude" | "maxDistance">,
  candidate: Pick<UserProfile, "latitude" | "longitude">
): number {
  if (
    viewer.latitude == null ||
    viewer.longitude == null ||
    candidate.latitude == null ||
    candidate.longitude == null
  ) {
    return 50
  }

  const km = distanceKm(
    { lat: viewer.latitude, lng: viewer.longitude },
    { lat: candidate.latitude, lng: candidate.longitude }
  )

  const cap = viewer.maxDistance ?? 100
  if (km <= 1) return 100
  if (km >= cap) return Math.max(0, Math.round(100 - ((km - cap) / cap) * 100))
  return Math.round(100 - (km / cap) * 60)
}

/** Activity: recency, profile completeness, recent swipe volume. */
export function scoreActivity(
  profileCompleteness: number,
  activitySignal: number
): number {
  const completeness = Math.min(1, Math.max(0, profileCompleteness)) * 100
  const activity = Math.min(1, Math.max(0, activitySignal)) * 100
  return Math.round(completeness * 0.45 + activity * 0.55)
}

export function computeCompatibility(
  viewer: UserProfile,
  candidate: UserProfile
): CompatibilityScore {
  const breakdown: CompatibilityBreakdown = {
    interests: scoreInterests(viewer.interestIds, candidate.interestIds),
    age: scoreAge(candidate.age, viewer.ageMin, viewer.ageMax),
    geo: scoreGeo(viewer, candidate),
    activity: scoreActivity(candidate.profileCompleteness, candidate.activitySignal),
  }

  const total = Math.round(
    breakdown.interests * WEIGHTS.interests +
      breakdown.age * WEIGHTS.age +
      breakdown.geo * WEIGHTS.geo +
      breakdown.activity * WEIGHTS.activity
  )

  return { total, breakdown }
}

export function rankCandidates<T extends { compatibilityScore: number }>(candidates: T[]): T[] {
  return [...candidates].sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}

export function scoreCandidateProfiles(
  viewer: UserProfile,
  candidates: Array<CandidateProfile & Pick<UserProfile, "profileCompleteness" | "activitySignal">>
): ScoredCandidate[] {
  return candidates.map((candidate) => {
    const candidateProfile: UserProfile = {
      id: candidate.id,
      age: candidate.age,
      interestIds: candidate.interestIds,
      latitude: candidate.lat,
      longitude: candidate.lng,
      ageMin: null,
      ageMax: null,
      maxDistance: null,
      profileCompleteness: candidate.profileCompleteness,
      activitySignal: candidate.activitySignal,
    }
    const scored = computeCompatibility(viewer, candidateProfile)
    return {
      ...candidate,
      compatibilityScore: scored.total,
      compatibilityBreakdown: scored.breakdown,
      compatibility: scored.total,
    }
  })
}
