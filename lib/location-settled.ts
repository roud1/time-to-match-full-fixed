import { parseStoredPosition } from "@/lib/geo"
import type { StoredUserProfile } from "@/lib/user-profile"

const SETTLED_KEY = "ttm-location-settled"
const PROFILE_KEY = "ttm-user-profile"

export function hasProfileCity(profile: StoredUserProfile | null | undefined): boolean {
  if (!profile) return false
  if (profile.cityId) return true
  return Boolean(profile.customCity?.trim())
}

function readStoredProfileCity(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return false
    const profile = JSON.parse(raw) as StoredUserProfile
    return hasProfileCity(profile)
  } catch {
    return false
  }
}

export function hasStoredGeoPosition(): boolean {
  if (typeof window === "undefined") return false
  return parseStoredPosition(localStorage.getItem("user-position")) !== null
}

/** User chose a city and/or we already have coordinates — skip GPS prompts. */
export function isLocationSettled(): boolean {
  if (typeof window === "undefined") return false
  if (localStorage.getItem(SETTLED_KEY) === "1") return true
  if (hasStoredGeoPosition()) return true
  return readStoredProfileCity()
}

export function markLocationSettled(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTLED_KEY, "1")
  window.dispatchEvent(new Event("ttm-location-settled"))
}
