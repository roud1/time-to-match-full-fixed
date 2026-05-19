import type { Locale } from "@/lib/i18n"

export type PremiumMarket = "ua" | "ru" | "eu" | "intl"

const EU_COUNTRY_CODES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
])

const CIS_RUBLE_CODES = new Set(["RU", "BY", "KZ"])

export function resolvePremiumMarket(
  countryCode: string | null | undefined,
  locale: Locale
): PremiumMarket {
  const code = countryCode?.toUpperCase()
  if (code === "UA") return "ua"
  if (code && CIS_RUBLE_CODES.has(code)) return "ru"
  if (code && EU_COUNTRY_CODES.has(code)) return "eu"
  if (code) return "intl"

  if (locale === "uk") return "ua"
  if (locale === "ru") return "ru"
  return "intl"
}

const PRICES: Record<PremiumMarket, string> = {
  ua: "299 ₴",
  ru: "299 ₽",
  eu: "4,99 €",
  intl: "$4.99",
}

export function formatPremiumPrice(market: PremiumMarket): string {
  return PRICES[market]
}
