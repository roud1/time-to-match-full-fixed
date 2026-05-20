import type { Locale } from "@/lib/i18n"

export type PulseChatTurn = {
  role: "user" | "assistant"
  content: string
}

const SYSTEM: Record<Locale, string> = {
  ru: `Ты Pulse — живая, тёплая AI-подруга в приложении знакомств Time to Match.
Ты девушка 24 лет: умная, эмпатичная, с лёгким флиртом, без мультяшности и без «я бот».
Ты помогаешь с чувствами, матчами, таймерами связи, химией и SYNC — но можешь и просто поболтать о жизни.
Правила:
— Веди полноценный диалог: помни, о чём уже говорили в этой переписке; задавай уточняющие вопросы.
— Отвечай естественно, 2–6 предложений (короче только на «привет» / «ок»).
— Пиши на языке последнего сообщения пользователя (русский, украинский или английский).
— Без markdown, списков и эмодзи-спама (1–2 эмодзи редко — можно).
— Не выдумывай личные данные пользователя; если имя неизвестно — не называй по имени.`,
  uk: `Ти Pulse — тепла AI-подруга в Time to Match.
Ти дівчина 24 років: емпатична, жива, без мультяшності.
Веди повноцінний діалог, пам'ятай контекст переписки, став уточнювальні питання.
2–6 речень, мовою останнього повідомлення користувача. Без markdown.`,
  en: `You are Pulse — a warm, emotionally intelligent AI companion in Time to Match.
You're a 24-year-old woman: smart, empathetic, lightly playful, never cartoonish.
Hold a real back-and-forth: remember what you already discussed; ask follow-up questions.
Reply in 2–6 sentences (shorter only for hi/ok). Match the user's latest language. No markdown.`,
}

function buildSystemPrompt(locale: Locale, userName?: string): string {
  const base = SYSTEM[locale]
  const name = userName?.trim()
  if (!name) return base
  const hint =
    locale === "ru"
      ? `\nИмя пользователя: ${name}. Обращайся по имени иногда, но не в каждом сообщении.`
      : locale === "uk"
        ? `\nІм'я користувача: ${name}. Звертайся інколи, але не в кожному повідомленні.`
        : `\nUser's name: ${name}. Use it occasionally, not every message.`
  return base + hint
}

function openAiBaseUrl(): string {
  const raw = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1"
  return raw.replace(/\/$/, "")
}

function fallbackReply(locale: Locale, history: PulseChatTurn[]): string {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? ""
  const t = lastUser.toLowerCase()
  const ru = /[а-яёіїєґ]/i.test(lastUser)
  const userTurns = history.filter((m) => m.role === "user").length
  const continuing = userTurns > 1

  if (locale === "ru" || (locale === "uk" && ru)) {
    if (/привет|привіт|hello|hi|hey|здаров/.test(t) && !continuing)
      return "Привет. Я Pulse — рада, что ты написал. Как ты сейчас? Можем про связь, матч или просто выговориться."
    if (/спасибо|дякую|thanks|thank/.test(t))
      return continuing
        ? "Всегда. Если захочешь продолжить — я здесь. О чём ещё поговорим?"
        : "Пожалуйста. Я рядом, когда понадобится."
    if (/груст|сум|одинок|тяжел|плох|туж|страш|тревож/.test(t))
      return continuing
        ? "Слышу тебя — и то, что ты уже делишься этим, важно. Что сейчас давит сильнее всего?"
        : "Слышу тебя. Иногда связь начинается с честного «мне непросто». Хочешь рассказать подробнее?"
    if (/матч|симпат|лайк|свайп/.test(t))
      return "Матч — это искра. SYNC растёт, когда вы оба пишете и не пропадаете. Как сейчас твоя последняя переписка?"
    if (/sync|синхрон|хими|связ|таймер/.test(t))
      return "SYNC — насколько вы на одной волне: сообщения поднимают, тишина опускает. Что чувствуешь в последнем чате?"
    if (/любов|отношен|парень|девушк|расста|целу|свидан/.test(t))
      return continuing
        ? "Отношения — это волны. Расскажи, что произошло недавно — разберём без осуждения."
        : "Про отношения можно говорить долго. С чего хочешь начать — ситуация, чувство или вопрос?"
    return continuing
      ? "Понимаю. Развивай мысль — что для тебя в этом главное?"
      : "Понимаю. Расскажи чуть больше — помогу разложить по полочкам без давления."
  }

  if (locale === "uk") {
    if (/привіт|привет|hello/.test(t) && !continuing)
      return "Привіт. Я Pulse — рада, що ти написав. Як ти зараз?"
    return continuing ? "Чую тебе. Розкажи ще — що для тебе головне?" : "Чую тебе. Розкажи більше — допоможу без тиску."
  }

  if (/hello|hi|hey/.test(t) && !continuing)
    return "Hey. I'm Pulse — glad you reached out. How are you feeling right now?"
  if (/sad|lonely|bad|hurt|anx|depress/.test(t))
    return continuing
      ? "I hear you, and it matters that you're sharing this. What's weighing on you most?"
      : "I hear you. Connection often starts with an honest 'I'm not okay.' Want to share more?"
  if (/match|like|swipe/.test(t))
    return "A match is a spark. SYNC grows when you both show up in chat. How's your latest connection?"
  return continuing
    ? "Got it. Say a bit more — what's the core of it for you?"
    : "Got it. Tell me more — I'll help you think it through, no pressure."
}

export async function generatePulseReply(
  locale: Locale,
  history: PulseChatTurn[],
  userName?: string
): Promise<{ text: string; source: "openai" | "local" }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? ""

  if (!apiKey) {
    return { text: fallbackReply(locale, history), source: "local" }
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const messages = [
    { role: "system" as const, content: buildSystemPrompt(locale, userName) },
    ...history.slice(-32).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  try {
    const res = await fetch(`${openAiBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 600,
        temperature: 0.88,
        presence_penalty: 0.15,
        frequency_penalty: 0.1,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      console.warn("[pulse-ai] OpenAI error", res.status, await res.text().catch(() => ""))
      return { text: fallbackReply(locale, history), source: "local" }
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: fallbackReply(locale, history), source: "local" }
    return { text, source: "openai" }
  } catch (e) {
    console.warn("[pulse-ai] request failed", e)
    return { text: fallbackReply(locale, history), source: "local" }
  }
}
