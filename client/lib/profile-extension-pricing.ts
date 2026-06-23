import type { Locale } from "@/client/lib/i18n"
import { resolvePremiumMarket, type PremiumMarket } from "@/client/lib/premium-pricing"

/** One-time profile timer extension (+24h), priced for Ukraine. */
export const PROFILE_EXTENSION_PRICE_UAH = 99

const EXTENSION_PRICES: Record<PremiumMarket, string> = {
  ua: "99 ₴",
  ru: "249 ₽",
  eu: "2,49 €",
  intl: "$2.49",
}

export function formatProfileExtensionPrice(
  countryCode: string | null | undefined,
  locale: Locale
): string {
  return EXTENSION_PRICES[resolvePremiumMarket(countryCode, locale)]
}
