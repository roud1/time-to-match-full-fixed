import type { CommonInterest } from "@/client/lib/interests/types"
import type { DiscoverFilters } from "@/client/lib/discover/types"

/** Viewer or candidate profile inputs for compatibility scoring. */
export type UserProfile = {
  id: string
  age: number
  interestIds: number[]
  latitude: number | null
  longitude: number | null
  ageMin: number | null
  ageMax: number | null
  maxDistance: number | null
  /** 0–1 profile completeness (bio, photos, interests). */
  profileCompleteness: number
  /** 0–1 recent activity signal. */
  activitySignal: number
}

export type CompatibilityBreakdown = {
  interests: number
  age: number
  geo: number
  activity: number
}

export type CompatibilityScore = {
  total: number
  breakdown: CompatibilityBreakdown
}

export type CandidateProfile = {
  id: string
  name: string
  age: number
  gender: "male" | "female"
  bio: string
  location: string
  distanceKm: number | null
  image: string
  images: string[]
  interests: string[]
  interestIds: number[]
  lat: number | null
  lng: number | null
  purpose: string | null
  commonInterests: CommonInterest[]
  photoVerified: boolean
}

export type ScoredCandidate = CandidateProfile & {
  compatibilityScore: number
  compatibilityBreakdown: CompatibilityBreakdown
  /** Legacy field kept for existing clients. */
  compatibility: number
}

export type DiscoverFeedProfile = ScoredCandidate & {
  rankingScore?: number
  candidateTier?: "hot" | "normal" | "low"
}

export type LikeResult =
  | { ok: true; liked: true; matched: false }
  | { ok: true; liked: true; matched: true; matchId: string }
  | { ok: false; code: "not_found" | "self" | "blocked" }

export type PassResult =
  | { ok: true; passed: true }
  | { ok: false; code: "not_found" | "self" | "blocked" }

export type DiscoverFeedOptions = {
  viewerId: string
  filters: DiscoverFilters
  viewerLat?: number | null
  viewerLng?: number | null
}
