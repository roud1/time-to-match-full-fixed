import type { Locale } from "@/lib/i18n/config"
import { localeFromCountryCode as localeFromCountry } from "@/lib/i18n/config"
import { markLocationSettled } from "@/lib/location-settled"

import { getCityCoords } from "@/lib/cities"

/** Profile cities in display order (index matches profile cards). */
export const PROFILE_CITY_COORDS = [
  getCityCoords("kyiv")!,
  getCityCoords("lviv")!,
  getCityCoords("odesa")!,
  getCityCoords("kharkiv")!,
] as const

export type GeoPosition = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371

export function distanceKm(from: GeoPosition, to: GeoPosition): number {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(locale: Locale, km: number): string {
  const value = km < 1 ? 1 : Math.round(km)
  return locale === "en" || locale === "de" || locale === "es" || locale === "pl" || locale === "fr" || locale === "it" || locale === "tr"
    ? `${value} km`
    : `${value} км`
}

export function localeFromCountryCode(code: string | undefined): Locale | null {
  return localeFromCountry(code)
}

export function parseStoredPosition(raw: string | null): GeoPosition | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as { lat: number; lng: number; ts?: number }
    if (typeof data.lat !== "number" || typeof data.lng !== "number") return null
    if (data.ts && Date.now() - data.ts > 1000 * 60 * 60 * 12) return null
    return { lat: data.lat, lng: data.lng }
  } catch {
    return null
  }
}

export function storePosition(position: GeoPosition) {
  if (typeof window === "undefined") return
  localStorage.setItem(
    "user-position",
    JSON.stringify({ ...position, ts: Date.now() })
  )
  markLocationSettled()
}
