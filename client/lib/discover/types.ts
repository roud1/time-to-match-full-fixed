import type { CommonInterest } from "@/client/lib/interests/types"
import type { SwipeProfile } from "@/client/lib/demo-profiles"

/** Discover / swipe card with compatibility fields. */
export type Profile = SwipeProfile

export type CompatibilityBreakdown = {
  interests: number
  age: number
  geo: number
  activity: number
}

export type DiscoverProfile = {
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
  lat: number | null
  lng: number | null
  purpose: string | null
  /** Weighted compatibility 0–100 from matching service. */
  compatibilityScore?: number
  compatibilityBreakdown?: CompatibilityBreakdown
  /** Legacy alias; same as compatibilityScore when present. */
  compatibility: number
  commonInterests: CommonInterest[]
  photoVerified: boolean
}

export type DiscoverFilters = {
  purpose?: string
  gender?: "male" | "female"
  ageMin?: number
  ageMax?: number
  minAge?: number
  maxAge?: number
  maxDistance?: number
}
