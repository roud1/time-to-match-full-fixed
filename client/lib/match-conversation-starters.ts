import type { Locale } from "@/client/lib/i18n"
import type { StoredUserProfile } from "@/client/lib/user-profile"
import type { InterestId } from "@/client/lib/interests"

/**
 * Match conversation starters — personalised by shared interests.
 * Priority:
 *   1. Shared interests → interest-specific questions (up to 2)
 *   2. Generic locale + gender fallbacks (fill to 3 total)
 */

// ── Interest → question map (keyed by InterestId) ────────────────────────
const INTEREST_QUESTIONS: Record<InterestId, { ru: string; en: string; uk: string }> = {
  travel: {
    ru: "Куда бы ты поехал прямо сейчас, если бы мог?",
    en: "Where would you go right now if you could?",
    uk: "Куди б ти поїхав прямо зараз, якби міг?",
  },
  coffee: {
    ru: "Ты за первую чашку кофе молча или с разговорами?",
    en: "Are you a silent first cup or a talking first cup person?",
    uk: "Ти за першу чашку кави мовчки чи з розмовами?",
  },
  photography: {
    ru: "Что ты чаще всего фотографируешь — и почему именно это?",
    en: "What do you photograph most — and why that?",
    uk: "Що ти найчастіше фотографуєш — і чому саме це?",
  },
  art: {
    ru: "Последний раз когда тебя захватило что-то визуальное — что это было?",
    en: "The last time something visual genuinely stopped you — what was it?",
    uk: "Останній раз коли тебе захопило щось візуальне — що це було?",
  },
  music: {
    ru: "Какая песня сейчас у тебя на повторе?",
    en: "What song is on repeat for you right now?",
    uk: "Яка пісня зараз у тебе на повторі?",
  },
  sports: {
    ru: "Зал по расписанию или пробежка по настроению?",
    en: "Scheduled gym or run when you feel like it?",
    uk: "Зал за розкладом чи пробіжка за настроєм?",
  },
  fitness: {
    ru: "Зал по расписанию или пробежка по настроению?",
    en: "Scheduled gym or run when you feel like it?",
    uk: "Зал за розкладом чи пробіжка за настроєм?",
  },
  yoga: {
    ru: "Ты за утреннюю практику или вечернюю?",
    en: "Morning practice or evening practice?",
    uk: "Ти за ранкову практику чи вечірню?",
  },
  cooking: {
    ru: "Что ты готовишь когда хочешь произвести впечатление?",
    en: "What do you cook when you want to impress someone?",
    uk: "Що ти готуєш коли хочеш справити враження?",
  },
  movies: {
    ru: "Последний фильм который тебя реально зацепил — какой?",
    en: "What's the last film that actually got to you?",
    uk: "Останній фільм який тебе справді зачепив — який?",
  },
  books: {
    ru: "Какая книга изменила тебя больше всего?",
    en: "What book changed you the most?",
    uk: "Яка книга змінила тебе найбільше?",
  },
  nightlife: {
    ru: "Твой идеальный вечер пятницы — что это?",
    en: "What's your ideal Friday evening look like?",
    uk: "Твій ідеальний вечір п'ятниці — що це?",
  },
  nature: {
    ru: "Горы или море? И почему именно этот ответ?",
    en: "Mountains or sea? And why that one?",
    uk: "Гори чи море? І чому саме цей відповідь?",
  },
  design: {
    ru: "Что тебя последний раз удивило своим дизайном?",
    en: "What's the last thing that surprised you with its design?",
    uk: "Що тебе востаннє здивувало своїм дизайном?",
  },
  business: {
    ru: "Что тебя сейчас больше всего заряжает в том чем ты занимаешься?",
    en: "What energises you most about what you do right now?",
    uk: "Що тебе зараз найбільше заряджає в тому чим ти займаєшся?",
  },
  gaming: {
    ru: "Настолки или видеоигры? Или и то и другое?",
    en: "Board games or video games? Or both?",
    uk: "Настілки чи відеоігри? Чи й те й інше?",
  },
  fashion: {
    ru: "Есть вещь которую ты надеваешь когда нужна уверенность?",
    en: "Is there something you put on when you need confidence?",
    uk: "Є річ яку ти надягаєш коли потрібна впевненість?",
  },
  pets: {
    ru: "Кошки или собаки? Или кто-то совсем другой?",
    en: "Cats or dogs? Or something completely different?",
    uk: "Коти чи собаки? Чи хтось зовсім інший?",
  },
  wine: {
    ru: "Красное или белое? И есть ли у тебя любимое?",
    en: "Red or white? And is there a favourite?",
    uk: "Червоне чи біле? І є улюблене?",
  },
  dance: {
    ru: "Ты танцуешь когда никто не смотрит?",
    en: "Do you dance when no one's watching?",
    uk: "Ти танцюєш коли ніхто не дивиться?",
  },
}

// ── Generic fallbacks ────────────────────────────────────────────────────
const GENERIC: Record<string, string[]> = {
  ru: [
    "Чем запомнится тебе этот день?",
    "Что ты делаешь когда хочешь выключить голову?",
    "Расскажи мне что-нибудь — что угодно.",
  ],
  uk: [
    "Чим запам'ятається тобі цей день?",
    "Що ти робиш коли хочеш вимкнути голову?",
    "Розкажи мені щось — що завгодно.",
  ],
  en: [
    "What's something that made today memorable?",
    "What do you do when you need to switch your brain off?",
    "Tell me something — anything.",
  ],
}

function localeKey(locale: Locale): "ru" | "en" | "uk" {
  if (locale === "ru") return "ru"
  if (locale === "uk") return "uk"
  return "en"
}

/**
 * Returns up to 3 personalised conversation starters.
 * @param sharedInterests - InterestId values both users have in common
 */
export function getMatchConversationStarters(
  locale: Locale,
  gender?: StoredUserProfile["gender"],
  sharedInterests: InterestId[] = []
): string[] {
  const lk = localeKey(locale)
  const results: string[] = []

  // 1. Interest-specific questions (up to 2)
  for (const id of sharedInterests) {
    if (results.length >= 2) break
    const entry = INTEREST_QUESTIONS[id]
    if (entry) results.push(entry[lk])
  }

  // 2. Fill to 3 with generics
  const generics = GENERIC[lk] ?? GENERIC.en
  for (const q of generics) {
    if (results.length >= 3) break
    if (!results.includes(q)) results.push(q)
  }

  return results
}
