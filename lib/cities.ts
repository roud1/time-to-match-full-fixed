import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"

export const CITIES = [
  { id: "kyiv", lat: 50.4501, lng: 30.5234, ru: "Киев", uk: "Київ", en: "Kyiv" },
  { id: "kharkiv", lat: 49.9935, lng: 36.2304, ru: "Харьков", uk: "Харків", en: "Kharkiv" },
  { id: "odesa", lat: 46.4825, lng: 30.7233, ru: "Одесса", uk: "Одеса", en: "Odesa" },
  { id: "dnipro", lat: 48.4647, lng: 35.0462, ru: "Днепр", uk: "Дніпро", en: "Dnipro" },
  { id: "lviv", lat: 49.8397, lng: 24.0297, ru: "Львов", uk: "Львів", en: "Lviv" },
  { id: "zaporizhzhia", lat: 47.8388, lng: 35.1396, ru: "Запорожье", uk: "Запоріжжя", en: "Zaporizhzhia" },
  { id: "vinnytsia", lat: 49.2331, lng: 28.4682, ru: "Винница", uk: "Вінниця", en: "Vinnytsia" },
  { id: "poltava", lat: 49.5883, lng: 34.5514, ru: "Полтава", uk: "Полтава", en: "Poltava" },
  { id: "chernihiv", lat: 51.4982, lng: 31.2893, ru: "Чернигов", uk: "Чернігів", en: "Chernihiv" },
  { id: "ivano-frankivsk", lat: 48.9226, lng: 24.7111, ru: "Ивано-Франковск", uk: "Івано-Франківськ", en: "Ivano-Frankivsk" },
  { id: "ternopil", lat: 49.5535, lng: 25.5948, ru: "Тернополь", uk: "Тернопіль", en: "Ternopil" },
  { id: "lutsk", lat: 50.7472, lng: 25.3254, ru: "Луцк", uk: "Луцьк", en: "Lutsk" },
  { id: "rivne", lat: 50.6199, lng: 26.2516, ru: "Ровно", uk: "Рівне", en: "Rivne" },
  { id: "sumy", lat: 50.9077, lng: 34.7981, ru: "Сумы", uk: "Суми", en: "Sumy" },
  { id: "mykolaiv", lat: 46.975, lng: 31.9946, ru: "Николаев", uk: "Миколаїв", en: "Mykolaiv" },
  { id: "uzhhorod", lat: 48.6208, lng: 22.2879, ru: "Ужгород", uk: "Ужгород", en: "Uzhhorod" },
] as const

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
  return locale === "uk" ? city.uk : locale === "en" ? city.en : city.ru
}

export function getCityCoords(id: CityId): GeoPosition {
  const city = CITIES.find((c) => c.id === id)!
  return { lat: city.lat, lng: city.lng }
}

export function findCityIdFromName(name: string | null | undefined): CityId | null {
  if (!name) return null
  const normalized = name.trim().toLowerCase()
  for (const city of CITIES) {
    const variants = [city.ru, city.uk, city.en, city.id].map((v) => v.toLowerCase())
    if (variants.some((v) => v === normalized || normalized.includes(v) || v.includes(normalized))) {
      return city.id
    }
  }
  return null
}

export function getCitiesForLocale(locale: Locale) {
  return CITIES.map((city) => ({
    id: city.id,
    label: getCityLabel(city.id, locale),
  })).sort((a, b) => a.label.localeCompare(b.label, locale === "uk" ? "uk" : locale === "ru" ? "ru" : "en"))
}
