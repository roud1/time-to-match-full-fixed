import type { Locale } from "@/client/lib/i18n/config"

const LONG_NIGHT: Partial<Record<Locale, string>> = {
  ru: "Долгий ночной разговор",
  uk: "Довга нічна розмова",
  en: "A long night conversation",
  de: "Langes Gespräch in der Nacht",
  es: "Larga conversación nocturna",
  pl: "Długa nocna rozmowa",
  fr: "Longue conversation nocturne",
  it: "Lunga conversazione notturna",
  tr: "Uzun bir gece sohbeti",
}

const FIRST_DEEP: Partial<Record<Locale, string>> = {
  ru: "Первый глубокий разговор",
  uk: "Перша глибока розмова",
  en: "First deep conversation",
  de: "Erstes tiefes Gespräch",
  es: "Primera charla profunda",
  pl: "Pierwsza głęboka rozmowa",
  fr: "Première conversation profonde",
  it: "Prima conversazione profonda",
  tr: "İlk derin sohbet",
}

export function aiMemoryLabel(locale: Locale, key: "long_night" | "first_deep_talk"): string {
  const map = key === "long_night" ? LONG_NIGHT : FIRST_DEEP
  return map[locale] ?? map.ru ?? map.en ?? ""
}
