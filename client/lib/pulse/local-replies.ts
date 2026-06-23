import type { Locale } from "@/client/lib/i18n"

const FALLBACK: Record<string, string[]> = {
  ru: [
    "Слушаю. Расскажи, что сейчас важнее — первое сообщение, поддержать диалог или разобрать ситуацию?",
    "Можно начать мягко: «Привет! Увидел(а), что нам интересны одни темы — как прошёл день?»",
    "Если хочется теплее — задай один открытый вопрос и коротко поделись своим настроением. Это работает лучше длинных монологов.",
    "Пауза в переписке — нормально. Не дави — лучше одно искреннее сообщение, чем пять нейтральных.",
  ],
  uk: [
    "Слухаю. Що зараз важливіше — перше повідомлення, підтримати діалог чи розібрати ситуацію?",
    "Можна почати м’яко: «Привіт! Помітив(ла), що нам цікаві одні теми — як минув день?»",
    "Якщо хочеться тепліше — постав одне відкрите питання і коротко поділися настроєм.",
  ],
  en: [
    "I'm listening. What matters most right now — an opener, keeping the chat alive, or reading the vibe?",
    "Try something light: “Hey! Looks like we’re into similar things — how’s your day going?”",
    "Warmth beats length: one open question plus a honest line about your mood usually lands well.",
    "A quiet chat is normal. One real message beats five neutral pings.",
  ],
}

export function pickLocalPulseReply(locale: Locale, userText: string): string {
  const pool = FALLBACK[locale] ?? FALLBACK.en
  const lower = userText.toLowerCase()
  if (lower.includes("привет") || lower.includes("hello") || lower.includes("hi")) {
    return pool[1] ?? pool[0]
  }
  const idx = Math.abs(userText.length + userText.charCodeAt(0)) % pool.length
  return pool[idx] ?? pool[0]
}
