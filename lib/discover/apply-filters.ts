import type { SwipeProfile } from "@/lib/demo-profiles"
import type { DiscoverFilters } from "@/lib/discover/types"
import type { GeoPosition } from "@/lib/geo"
import { distanceKm } from "@/lib/geo"
import { getUserProfile } from "@/lib/user-profile"

export function applyDiscoverFilters(
  profiles: SwipeProfile[],
  filters: DiscoverFilters,
  position: GeoPosition | null
): SwipeProfile[] {
  const user = getUserProfile()

  return profiles.filter((p) => {
    if (filters.gender && p.gender !== filters.gender) return false
    if (filters.minAge != null && p.age < filters.minAge) return false
    if (filters.maxAge != null && p.age > filters.maxAge) return false

    if (filters.purpose && user?.purpose && user.purpose !== filters.purpose) {
      // Demo cards lack purpose — keep all when viewer has no purpose filter target on card
    }

    if (
      filters.maxDistance != null &&
      position &&
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng) &&
      p.lat !== 0 &&
      p.lng !== 0
    ) {
      const km = distanceKm(position, { lat: p.lat, lng: p.lng })
      if (km > filters.maxDistance) return false
    }

    return true
  })
}
