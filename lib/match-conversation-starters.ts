import type { Locale } from "@/lib/i18n"

/** Suggested first messages the user can send after a match. */
export const MATCH_CONVERSATION_STARTERS: Record<Locale, string[]> = {
  ru: [
    "Привет! Рада, что мы совпали 👋",
    "Как проходит твой день?",
    "Чем увлекаешься в свободное время?",
    "Давай познакомимся — с чего начнём?",
  ],
  uk: [
    "Привіт! Рада, що ми збіглися 👋",
    "Як проходить твій день?",
    "Чим захоплюєшся у вільний час?",
    "Давай познайомимось — з чого почнемо?",
  ],
  en: [
    "Hey! Glad we matched 👋",
    "How's your day going?",
    "What do you like to do for fun?",
    "Let's get to know each other — where should we start?",
  ],
}
