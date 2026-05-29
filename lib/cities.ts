import type { Locale } from "@/lib/i18n/config"
import { localeToBcp47 } from "@/lib/i18n/config"
import { pickLocalized } from "@/lib/i18n/pick-localized"
import type { GeoPosition } from "@/lib/geo"
import { UA_CITIES } from "@/lib/ua-cities-data"

export const CITIES = UA_CITIES

export type CityId = (typeof CITIES)[number]["id"]
export const CUSTOM_CITY_ID = "other" as const
export type CitySelectValue = CityId | typeof CUSTOM_CITY_ID | ""

export function getProfileCityName(
  profile: { cityId?: CityId; customCity?: string },
  locale: Locale
): string {
  if (profile.customCity?.trim()) return profile.customCity.trim()
  if (profile.cityId) return getCityLabel(profile.cityId, locale)
  return ""
}

export function getCityLabel(id: CityId, locale: Locale): string {
  const city = CITIES.find((c) => c.id === id)
  if (!city) return id
  return pickLocalized(locale, city)
}

export function getCityCoords(id: CityId): GeoPosition {
  const city = CITIES.find((c) => c.id === id)!
  return { lat: city.lat, lng: city.lng }
}

function cityNameVariants(city: (typeof CITIES)[number]): string[] {
  return [city.ru, city.uk, city.en, city.id].map((v) => v.toLowerCase())
}

export function findCityIdFromName(name: string | null | undefined): CityId | null {
  if (!name) return null
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null

  for (const city of CITIES) {
    const variants = cityNameVariants(city)
    if (variants.includes(normalized)) return city.id
  }

  for (const city of CITIES) {
    const variants = cityNameVariants(city)
    if (variants.some((v) => v.startsWith(normalized) || normalized.startsWith(v))) {
      return city.id
    }
  }

  return null
}

export function filterCities(query: string, locale: Locale, limit = 12) {
  const cities = getCitiesForLocale(locale)
  const q = query.trim().toLowerCase()
  if (!q) return cities.slice(0, limit)

  const scored = cities
    .map((city) => {
      const label = city.label.toLowerCase()
      let score = 0
      if (label === q) score = 100
      else if (label.startsWith(q)) score = 80
      else if (label.includes(q)) score = 50
      return { city, score }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.city.label.localeCompare(b.city.label, localeToBcp47(locale)))

  return scored.slice(0, limit).map((row) => row.city)
}

export function getCitiesForLocale(locale: Locale) {
  return CITIES.map((city) => ({
    id: city.id,
    label: getCityLabel(city.id, locale),
  })).sort((a, b) => a.label.localeCompare(b.label, localeToBcp47(locale)))
}
