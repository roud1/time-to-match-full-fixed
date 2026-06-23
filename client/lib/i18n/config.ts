export const LOCALES = ["ru", "uk", "en", "de", "es", "pl", "fr", "it", "tr"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "ru"

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
  de: "Deutsch",
  es: "Español",
  pl: "Polski",
  fr: "Français",
  it: "Italiano",
  tr: "Türkçe",
}

export const localeShortNames: Record<Locale, string> = {
  ru: "RU",
  uk: "UA",
  en: "EN",
  de: "DE",
  es: "ES",
  pl: "PL",
  fr: "FR",
  it: "IT",
  tr: "TR",
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export function localeToBcp47(locale: Locale): string {
  const map: Record<Locale, string> = {
    ru: "ru-RU",
    uk: "uk-UA",
    en: "en-GB",
    de: "de-DE",
    es: "es-ES",
    pl: "pl-PL",
    fr: "fr-FR",
    it: "it-IT",
    tr: "tr-TR",
  }
  return map[locale]
}

/** Fallback when a locale file is missing a key */
export const LOCALE_FALLBACK: Record<Locale, Locale[]> = {
  ru: ["ru"],
  uk: ["uk", "ru"],
  en: ["en", "ru"],
  de: ["de", "en", "ru"],
  es: ["es", "en", "ru"],
  pl: ["pl", "en", "ru"],
  fr: ["fr", "en", "ru"],
  it: ["it", "en", "ru"],
  tr: ["tr", "en", "ru"],
}

export function localeFromCountryCode(code: string | undefined): Locale | null {
  if (!code) return null
  const upper = code.toUpperCase()
  if (upper === "UA") return "uk"
  if (["RU", "BY", "KZ"].includes(upper)) return "ru"
  if (upper === "DE" || upper === "AT" || upper === "CH") return "de"
  if (["ES", "MX", "AR", "CO"].includes(upper)) return "es"
  if (upper === "PL") return "pl"
  if (["FR", "BE", "LU", "MC"].includes(upper)) return "fr"
  if (upper === "IT") return "it"
  if (upper === "TR") return "tr"
  return "en"
}
