import { shareInflight } from "@/client/lib/inflight"
import { discoverIdToNumeric } from "@/client/lib/discover/map-profile"

export type IncomingLikeProfile = {
  userId: string
  name: string
  age: number
  gender: "male" | "female"
  image: string
  location: string
  likedAt: string
}

export type IncomingLikeTeaser = {
  userId: string
  image: string
  likedAt: string
}

export type IncomingLikesResponse = {
  profiles: IncomingLikeProfile[]
  teasers?: IncomingLikeTeaser[]
  count: number
  premiumRequired: boolean
  code?: "premium_required"
}

export function fetchIncomingLikes(): Promise<IncomingLikesResponse> {
  // Shared with the likes badge, which asks for the same endpoint at the same time.
  return shareInflight("likes-incoming", async () => {
    const res = await fetch("/api/likes/incoming", { credentials: "include", cache: "no-store" })
    if (!res.ok) {
      return { profiles: [], count: 0, premiumRequired: false }
    }
    return (await res.json()) as IncomingLikesResponse
  })
}

export function incomingLikeToProfileId(userId: string): number {
  return discoverIdToNumeric(userId)
}
