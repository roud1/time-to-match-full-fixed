import type { Locale } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { DiscoverProfile } from "@/lib/discover/types"
import { formatDistance } from "@/lib/geo"

/** Stable numeric id for demo social store from UUID. */
export function discoverIdToNumeric(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return 200_000 + (Math.abs(h) % 700_000)
}

export function discoverProfileToSwipe(
  card: DiscoverProfile,
  locale: Locale
): SwipeProfile {
  const distance =
    card.distanceKm != null ? formatDistance(locale, card.distanceKm) : "—"

  return {
    id: discoverIdToNumeric(card.id),
    name: card.name,
    age: card.age,
    gender: card.gender,
    location: card.location,
    distance,
    image: card.image,
    images: card.images,
    timeLeft: "—",
    bio: card.bio,
    interests: card.interests,
    lat: card.lat ?? 0,
    lng: card.lng ?? 0,
    compatibility: card.compatibility,
    commonInterests: card.commonInterests,
    userId: card.id,
    photoVerified: card.photoVerified,
  }
}
