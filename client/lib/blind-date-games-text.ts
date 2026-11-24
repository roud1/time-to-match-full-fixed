import type { Locale } from "@/client/lib/i18n"
import type { CompatCategory, GameKey } from "@/server/blind-date/games/catalog"
import data from "./blind-date-games-text.json"

/** Texts of the Blind Date games (prompts, options, titles) in all 9 languages. */
type LocaleGameText = {
  games: Record<GameKey, { title: string; desc: string }>
  categories: Record<CompatCategory, string>
  prompts: Record<string, { q: string; o: string[] }>
}

const TEXT = data as unknown as Record<string, LocaleGameText>

export function gameText(locale: Locale): LocaleGameText {
  return TEXT[locale] ?? TEXT.en
}

export function promptText(locale: Locale, prompt: string): { q: string; o: string[] } {
  return gameText(locale).prompts[prompt] ?? TEXT.en.prompts[prompt] ?? { q: prompt, o: [] }
}
