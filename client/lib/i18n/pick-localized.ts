import type { Locale } from "@/client/lib/i18n/config"
import { LOCALE_FALLBACK } from "@/client/lib/i18n/config"

export type LocalizedFields = {
  ru: string
  uk?: string
  en?: string
  de?: string
  es?: string
  pl?: string
  fr?: string
  it?: string
  tr?: string
}

export function pickLocalized(locale: Locale, row: LocalizedFields): string {
  for (const loc of LOCALE_FALLBACK[locale]) {
    const value = row[loc as keyof LocalizedFields]
    if (typeof value === "string" && value.length > 0) return value
  }
  return row.ru
}
