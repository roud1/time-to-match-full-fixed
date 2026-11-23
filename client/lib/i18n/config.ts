export const LOCALES = ["ru", "uk", "en", "de", "es", "pl", "fr", "it", "tr"] as const
export type Locale = (typeof LOCALES)[number]

/** Fallback when the device language is not supported (European audience: English). */
export const DEFAULT_LOCALE: Locale = "en"

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

/**
 * First supported locale from the device / browser language list (e.g. navigator.languages or the
 * Accept-Language header), by primary subtag: "de-AT" -> "de", "uk-UA" -> "uk". Fallback: English.
 */
export function detectLocale(languages: readonly string[] | null | undefined): Locale {
  for (const raw of languages ?? []) {
    const primary = raw.trim().toLowerCase().split(/[-_;]/)[0] ?? ""
    if (isLocale(primary)) return primary
  }
  return DEFAULT_LOCALE
}

/** Accept-Language header -> ordered language tags (q-values respected). */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return []
  return header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      const weight = q ? Number(q.slice(2)) : 1
      return { tag: tag ?? "", weight: Number.isFinite(weight) ? weight : 0, index }
    })
    .filter((x) => x.tag && x.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map((x) => x.tag)
}
