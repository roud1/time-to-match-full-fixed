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

export const ENERGY_TAG_OPTIONS = [
  { id: "radiant", ru: "Сияние", uk: "Сяйво", en: "Radiant" },
  { id: "grounded", ru: "Заземлённость", uk: "Заземленість", en: "Grounded" },
  { id: "magnetic", ru: "Магнетизм", uk: "Магнетизм", en: "Magnetic" },
  { id: "tender", ru: "Нежность", uk: "Ніжність", en: "Tender" },
  { id: "electric", ru: "Искра", uk: "Іскра", en: "Electric" },
  { id: "serene", ru: "Покой", uk: "Спокій", en: "Serene" },
] as const

export const COMMUNICATION_STYLE_OPTIONS = [
  { id: "direct", ru: "Прямо и честно", uk: "Прямо й чесно", en: "Direct & honest" },
  { id: "playful", ru: "С юмором", uk: "З гумором", en: "Playful banter" },
  { id: "deep", ru: "Глубокие разговоры", uk: "Глибокі розмови", en: "Deep talks" },
  { id: "slow", ru: "Медленный ритм", uk: "Повільний ритм", en: "Slow burn" },
  { id: "voice", ru: "Голос важнее текста", uk: "Голос важливіший за текст", en: "Voice-first" },
] as const

export const CONNECTION_PREF_OPTIONS = [
  { id: "quality", ru: "Качество, не количество", uk: "Якість, не кількість", en: "Quality over quantity" },
  { id: "spontaneous", ru: "Спонтанные встречи", uk: "Спонтанні зустрічі", en: "Spontaneous meetups" },
  { id: "digital", ru: "Сначала переписка", uk: "Спочатку листування", en: "Text-first connection" },
  { id: "local", ru: "Рядом, в одном городе", uk: "Поруч, в одному місті", en: "Same city energy" },
  { id: "open", ru: "Открыт к сюрпризам", uk: "Відкритий до сюрпризів", en: "Open to surprises" },
] as const

export type EnergyTagId = (typeof ENERGY_TAG_OPTIONS)[number]["id"]
export type CommunicationStyleId = (typeof COMMUNICATION_STYLE_OPTIONS)[number]["id"]
export type ConnectionPrefId = (typeof CONNECTION_PREF_OPTIONS)[number]["id"]

export const MIN_ENERGY_TAGS = 1
export const MAX_ENERGY_TAGS = 3

export function getEnergyTagLabel(id: string, locale: Locale): string {
  const row = ENERGY_TAG_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export function getCommunicationStyleLabel(id: string, locale: Locale): string {
  const row = COMMUNICATION_STYLE_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export function getConnectionPrefLabel(id: string, locale: Locale): string {
  const row = CONNECTION_PREF_OPTIONS.find((v) => v.id === id)
  if (!row) return id
  return locale === "uk" ? row.uk : locale === "en" ? row.en : row.ru
}

export const MIN_VIBES = 2
export const MAX_VIBES = 5
