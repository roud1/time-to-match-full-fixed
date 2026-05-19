import type { Locale } from "@/lib/i18n"

export const INTERESTS = [
  { id: "travel", ru: "Путешествия", uk: "Подорожі", en: "Travel" },
  { id: "coffee", ru: "Кофе", uk: "Кава", en: "Coffee" },
  { id: "photography", ru: "Фотография", uk: "Фотографія", en: "Photography" },
  { id: "art", ru: "Искусство", uk: "Мистецтво", en: "Art" },
  { id: "music", ru: "Музыка", uk: "Музика", en: "Music" },
  { id: "sports", ru: "Спорт", uk: "Спорт", en: "Sports" },
  { id: "fitness", ru: "Фитнес", uk: "Фітнес", en: "Fitness" },
  { id: "yoga", ru: "Йога", uk: "Йога", en: "Yoga" },
  { id: "cooking", ru: "Кулинария", uk: "Кулінарія", en: "Cooking" },
  { id: "movies", ru: "Кино", uk: "Кіно", en: "Movies" },
  { id: "books", ru: "Книги", uk: "Книги", en: "Books" },
  { id: "nightlife", ru: "Вечеринки", uk: "Вечірки", en: "Nightlife" },
  { id: "nature", ru: "Природа", uk: "Природа", en: "Nature" },
  { id: "design", ru: "Дизайн", uk: "Дизайн", en: "Design" },
  { id: "business", ru: "Бизнес", uk: "Бізнес", en: "Business" },
  { id: "gaming", ru: "Игры", uk: "Ігри", en: "Gaming" },
  { id: "fashion", ru: "Мода", uk: "Мода", en: "Fashion" },
  { id: "pets", ru: "Животные", uk: "Тварини", en: "Pets" },
  { id: "wine", ru: "Вино", uk: "Вино", en: "Wine" },
  { id: "dance", ru: "Танцы", uk: "Танці", en: "Dance" },
] as const

export type InterestId = (typeof INTERESTS)[number]["id"]

export const MIN_INTERESTS = 3
export const MAX_INTERESTS = 8

export function getInterestLabel(id: InterestId, locale: Locale): string {
  const item = INTERESTS.find((i) => i.id === id)
  if (!item) return id
  return locale === "uk" ? item.uk : locale === "en" ? item.en : item.ru
}

export function getInterestsForLocale(locale: Locale) {
  return INTERESTS.map((item) => ({
    id: item.id,
    label: getInterestLabel(item.id, locale),
  }))
}

export function getInterestLabels(ids: InterestId[], locale: Locale): string[] {
  return ids.map((id) => getInterestLabel(id, locale))
}
