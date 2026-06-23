import type { Locale } from "@/client/lib/i18n/config"
import { localeToBcp47 } from "@/client/lib/i18n/config"

function localeTag(locale: Locale): string {
  return localeToBcp47(locale)
}

export function formatChatMessageTime(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(at)
}

export function formatChatThreadPreviewTime(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    hour: "numeric",
    minute: "2-digit",
  }).format(at)
}

export function formatMemoryDate(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(at)
}
