import type { Locale } from "@/lib/i18n"

export const VIBE_OPTIONS = [
  { id: "warm", ru: "Тёплый ритм", uk: "Теплий ритм", en: "Warm energy" },
  { id: "curious", ru: "Любопытство", uk: "Цікавість", en: "Curious mind" },
  { id: "bold", ru: "Смелость", uk: "Сміливість", en: "Bold spark" },
  { id: "calm", ru: "Спокойствие", uk: "Спокій", en: "Calm presence" },
  { id: "playful", ru: "Игра", uk: "Гра", en: "Playful" },
  { id: "deep", ru: "Глубина", uk: "Глибина", en: "Deep talk" },
  { id: "social", ru: "Светский", uk: "Світський", en: "Social" },
  { id: "minimal", ru: "Минимализм", uk: "Мінімалізм", en: "Minimal" },
] as const

export const INTENTION_OPTIONS = [
  { id: "serious", ru: "Серьёзные отношения", uk: "Серйозні стосунки", en: "Something serious" },
  { id: "casual", ru: "Без ярлыков", uk: "Без ярликів", en: "See where it goes" },
  { id: "friends", ru: "Сначала дружба", uk: "Спочатку дружба", en: "Friends first" },
  { id: "explore", ru: "Исследую себя", uk: "Досліджую себе", en: "Exploring" },
  { id: "open", ru: "Открыт(а) ко всему", uk: "Відкритий(-а) до всього", en: "Open to all" },
] as const

export const MOOD_OPTIONS = [
  { id: "charged", ru: "На подъёме", uk: "На підйомі", en: "Charged up" },
  { id: "cozy", ru: "Уютно", uk: "Затишно", en: "Cozy" },
  { id: "reflective", ru: "В размышлениях", uk: "У роздумах", en: "Reflective" },
  { id: "wild", ru: "Хочу приключений", uk: "Хочу пригод", en: "Adventure mode" },
  { id: "focused", ru: "В фокусе", uk: "У фокусі", en: "Focused" },
] as const

export type VibeId = (typeof VIBE_OPTIONS)[number]["id"]
export type IntentionId = (typeof INTENTION_OPTIONS)[number]["id"]
export type MoodId = (typeof MOOD_OPTIONS)[number]["id"]

export function getVibeLabel(id: string, locale: Locale): string {
  const row = VIBE_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export function getIntentionLabel(id: string, locale: Locale): string {
  const row = INTENTION_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export function getMoodLabel(id: string, locale: Locale): string {
  const row = MOOD_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export const MIN_VIBES = 2
export const MAX_VIBES = 5
