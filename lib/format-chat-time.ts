import type { Locale } from "@/lib/i18n"

function localeTag(locale: Locale): string {
  if (locale === "uk") return "uk-UA"
  if (locale === "ru") return "ru-RU"
  return "en-US"
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
