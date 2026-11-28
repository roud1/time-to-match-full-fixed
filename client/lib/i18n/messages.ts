import type ruMessages from "@/client/lib/i18n/locales/ru.json"
import { LOCALE_FALLBACK, type Locale } from "@/client/lib/i18n/config"

/** Russian is the source language: every key exists there. */
export type LocaleMessages = typeof ruMessages
export type TranslationKey = keyof LocaleMessages

type Pack = Partial<LocaleMessages>

/**
 * One lazy chunk per language. The browser downloads only the packs the current language needs
 * (itself plus its fallbacks), instead of all nine (~1 MB) on every launch.
 */
const LOADERS: Record<Locale, () => Promise<{ default: unknown }>> = {
  ru: () => import("@/client/lib/i18n/locales/ru.json"),
  uk: () => import("@/client/lib/i18n/locales/uk.json"),
  en: () => import("@/client/lib/i18n/locales/en.json"),
  de: () => import("@/client/lib/i18n/locales/de.json"),
  es: () => import("@/client/lib/i18n/locales/es.json"),
  pl: () => import("@/client/lib/i18n/locales/pl.json"),
  fr: () => import("@/client/lib/i18n/locales/fr.json"),
  it: () => import("@/client/lib/i18n/locales/it.json"),
  tr: () => import("@/client/lib/i18n/locales/tr.json"),
}

/** Merge a language with its fallbacks: later (more specific) packs win. */
export function mergeLocalePacks(locale: Locale, getPack: (loc: Locale) => Pack | undefined): LocaleMessages {
  const chain = [...LOCALE_FALLBACK[locale]].reverse()
  let merged: Record<string, unknown> = {}
  for (const loc of chain) {
    const pack = getPack(loc)
    if (pack) merged = { ...merged, ...pack }
  }
  return merged as LocaleMessages
}

const loaded = new Map<Locale, LocaleMessages>()

/** Client: the merged dictionary for `locale`, downloading the needed packs on first use. */
export async function loadLocaleMessages(locale: Locale): Promise<LocaleMessages> {
  const cached = loaded.get(locale)
  if (cached) return cached
  const chain = LOCALE_FALLBACK[locale]
  const packs = new Map<Locale, Pack>()
  await Promise.all(
    chain.map(async (loc) => {
      const mod = await LOADERS[loc]()
      packs.set(loc, mod.default as Pack)
    })
  )
  const merged = mergeLocalePacks(locale, (loc) => packs.get(loc))
  loaded.set(locale, merged)
  return merged
}

/** Client: seed the cache with the dictionary the server rendered the page with. */
export function rememberLocaleMessages(locale: Locale, messages: LocaleMessages): void {
  if (!loaded.has(locale)) loaded.set(locale, messages)
}
