import type { SwipeProfile } from "@/client/lib/demo-profiles"

export function getSwipeProfilePhotos(profile: Pick<SwipeProfile, "image" | "images">): string[] {
  if (profile.images?.length) return profile.images
  return [profile.image]
}
