import type { Locale } from "@/lib/i18n"
import type { StoredUserProfile } from "@/lib/user-profile"

type StarterPack = {
  male: string[]
  female: string[]
  neutral: string[]
}

/** Suggested first messages the user can send after a match (gender of the sender). */
const MATCH_CONVERSATION_STARTERS: Partial<Record<Locale, StarterPack>> = {
  ru: {
    male: [
      "Привет! Рад, что мы совпали 👋",
      "Как проходит твой день?",
      "Чем увлекаешься в свободное время?",
      "Давай познакомимся — с чего начнём?",
    ],
    female: [
      "Привет! Рада, что мы совпали 👋",
      "Как проходит твой день?",
      "Чем увлекаешься в свободное время?",
      "Давай познакомимся — с чего начнём?",
    ],
    neutral: [
      "Привет! Круто, что мы совпали 👋",
      "Как проходит твой день?",
      "Чем увлекаешься в свободное время?",
      "Давай познакомимся — с чего начнём?",
    ],
  },
  uk: {
    male: [
      "Привіт! Радий, що ми збіглися 👋",
      "Як проходить твій день?",
      "Чим захоплюєшся у вільний час?",
      "Давай познайомимось — з чого почнемо?",
    ],
    female: [
      "Привіт! Рада, що ми збіглися 👋",
      "Як проходить твій день?",
      "Чим захоплюєшся у вільний час?",
      "Давай познайомимось — з чого почнемо?",
    ],
    neutral: [
      "Привіт! Круто, що ми збіглися 👋",
      "Як проходить твій день?",
      "Чим захоплюєшся у вільний час?",
      "Давай познайомимось — з чого почнемо?",
    ],
  },
  en: {
    male: [
      "Hey! Glad we matched 👋",
      "How's your day going?",
      "What do you like to do for fun?",
      "Let's get to know each other — where should we start?",
    ],
    female: [
      "Hey! Glad we matched 👋",
      "How's your day going?",
      "What do you like to do for fun?",
      "Let's get to know each other — where should we start?",
    ],
    neutral: [
      "Hey! Glad we matched 👋",
      "How's your day going?",
      "What do you like to do for fun?",
      "Let's get to know each other — where should we start?",
    ],
  },
}

export function getMatchConversationStarters(
  locale: Locale,
  gender?: StoredUserProfile["gender"]
): string[] {
  const pack = MATCH_CONVERSATION_STARTERS[locale] ?? MATCH_CONVERSATION_STARTERS.en!
  if (gender === "male") return pack.male
  if (gender === "female") return pack.female
  return pack.neutral
}
