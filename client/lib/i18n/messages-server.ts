/** Server only (imported from app/layout.tsx): bundles every language, never shipped to the browser. */
import { type Locale } from "@/client/lib/i18n/config"
import { mergeLocalePacks, type LocaleMessages } from "@/client/lib/i18n/messages"
import enMessages from "@/client/lib/i18n/locales/en.json"
import ukMessages from "@/client/lib/i18n/locales/uk.json"
import deMessages from "@/client/lib/i18n/locales/de.json"
import esMessages from "@/client/lib/i18n/locales/es.json"
import plMessages from "@/client/lib/i18n/locales/pl.json"
import frMessages from "@/client/lib/i18n/locales/fr.json"
import itMessages from "@/client/lib/i18n/locales/it.json"
import trMessages from "@/client/lib/i18n/locales/tr.json"
import ruMessages from "@/client/lib/i18n/locales/ru.json"

const PACKS: Record<Locale, Partial<LocaleMessages>> = {
  ru: ruMessages as LocaleMessages,
  en: enMessages as Partial<LocaleMessages>,
  uk: ukMessages as Partial<LocaleMessages>,
  de: deMessages as Partial<LocaleMessages>,
  es: esMessages as Partial<LocaleMessages>,
  pl: plMessages as Partial<LocaleMessages>,
  fr: frMessages as Partial<LocaleMessages>,
  it: itMessages as Partial<LocaleMessages>,
  tr: trMessages as Partial<LocaleMessages>,
}

const cache = new Map<Locale, LocaleMessages>()

/** Server: the merged dictionary for the page's language, passed to the client provider. */
export function getLocaleMessages(locale: Locale): LocaleMessages {
  let dict = cache.get(locale)
  if (!dict) {
    dict = mergeLocalePacks(locale, (loc) => PACKS[loc])
    cache.set(locale, dict)
  }
  return dict
}
