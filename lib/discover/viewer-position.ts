import { getCityCoords } from "@/lib/cities"
import { parseStoredPosition, type GeoPosition } from "@/lib/geo"
import { isLocationSettled } from "@/lib/location-settled"
import { getUserProfile } from "@/lib/user-profile"

/** Anchor point for discover distances and API queries. */
export function resolveDiscoverViewerPosition(
  livePosition: GeoPosition | null | undefined
): GeoPosition | null {
  const profile = getUserProfile()

  if (isLocationSettled() && profile?.cityId) {
    return getCityCoords(profile.cityId)
  }

  if (livePosition) return livePosition

  const stored =
    typeof window !== "undefined"
      ? parseStoredPosition(localStorage.getItem("user-position"))
      : null
  if (stored) return stored

  if (
    profile?.latitude != null &&
    profile?.longitude != null &&
    Number.isFinite(profile.latitude) &&
    Number.isFinite(profile.longitude)
  ) {
    return { lat: profile.latitude, lng: profile.longitude }
  }

  if (profile?.cityId) {
    return getCityCoords(profile.cityId)
  }

  return null
}

export function hasDiscoverViewerPosition(
  livePosition: GeoPosition | null | undefined
): boolean {
  return resolveDiscoverViewerPosition(livePosition) != null
}
