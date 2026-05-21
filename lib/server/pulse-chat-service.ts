import {
  getOpenRouterClient,
  getOpenRouterModel,
  isOpenRouterConfigured,
} from "@/lib/server/openrouter"
import { pulseChatBodySchema, type PulseChatBody } from "@/lib/server/validation/pulse-chat"

const BANNED_REPLY_RE =
  /понимаю\.?\s*развивай\s+мысль/i

const SYSTEM: Record<string, string> = {
  ru: `Ты Pulse — AI-гид платформы Time to Match.
Тон: тёплый, краткий. Ты помощник по SYNC, связям и чатам — не матч из ленты.
Отвечай на последнее сообщение пользователя. Не повторяй предыдущий ответ. 2–3 предложения, русский, без эмодзи.`,
  uk: `Ти Pulse — AI-гід Time to Match. Відповідай на останнє повідомлення, не повторюй відповідь. 2–3 речення, українською.`,
  en: `You are Pulse, AI guide for Time to Match. Reply to the latest user message only. Do not repeat prior replies. 2–3 sentences, English.`,
}

function normalizeMessages(body: PulseChatBody) {
  const msgs = body.messages.map((m) => ({
    role: m.role,
    content: m.content.trim(),
  }))
  const deduped: typeof msgs = []
  for (const m of msgs) {
    const prev = deduped[deduped.length - 1]
    if (prev && prev.role === m.role && prev.content === m.content) continue
    deduped.push(m)
  }
  return deduped.slice(-24)
}

function pickVariant(options: string[], previous?: string): string {
  const filtered = previous ? options.filter((o) => o.trim() !== previous.trim()) : options
  const pool = filtered.length > 0 ? filtered : options
  const idx = Math.abs(hashString(previous ?? pool.join(""))) % pool.length
  return pool[idx]!
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

function localReply(body: PulseChatBody): string {
  const locale = body.locale ?? "en"
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const t = lastUser.toLowerCase().trim()
  const prevAssistant = [...body.messages].reverse().find((m) => m.role === "assistant")?.content

  if (locale === "ru") {
    if (/^(привет|здрав|хай|hi|hello|hey)(?:\s|$|!|,|\.)/i.test(t) || /^(привет|здрав|хай)$/i.test(t))
      return pickVariant(
        [
          "Привет! Я Pulse — помогу с SYNC, связями и чатами. Что важнее сейчас: матч, профиль или переписка?",
          "Рада тебя видеть. С чего начнём — синхронизация, совет по чату или твой профиль?",
        ],
        prevAssistant
      )
    if (/как\s+(твои\s+)?(дела|ты)|какая\s+связь|как\s+настроение/i.test(t))
      return pickVariant(
        [
          "На связи и готов помочь. Расскажи, что происходит в чате или с матчем — разберём вместе.",
          "Всё в порядке — здесь я для твоих связей. Есть кто-то, с кем хочешь усилить SYNC?",
          "Нормально, спасибо. А у тебя как — есть диалог, который хочется оживить?",
        ],
        prevAssistant
      )
    if (/sync|синхрон/i.test(t))
      return pickVariant(
        [
          "SYNC растёт от взаимных ответов и живого диалога. Напиши в чат — метрика оживёт.",
          "Смотри на SYNC как на ритм пары: быстрые ответы и интерес поднимают процент.",
        ],
        prevAssistant
      )
    if (/матч|лайк|свайп/i.test(t))
      return pickVariant(
        [
          "Если матч есть — начни с короткого вопроса по его интересам, не с «привет».",
          "Сильный профиль и один конкретный вопрос в чате работают лучше долгого ожидания.",
        ],
        prevAssistant
      )
    if (/помог|совет|что (написать|делать)/i.test(t))
      return pickVariant(
        [
          "Опиши ситуацию в двух фразах — подскажу, что написать и как поднять SYNC.",
          "Могу предложить первую фразу для чата, если скажешь, о чём профиль собеседника.",
        ],
        prevAssistant
      )
    return pickVariant(
      [
        "Слышу тебя. Расскажи подробнее — разберём связь, чат или профиль.",
        "Можем разобрать конкретную ситуацию: тишина в переписке, матч или твой профиль.",
        "Один живой вопрос в чате часто поднимает SYNC сильнее, чем долгое ожидание.",
      ],
      prevAssistant
    )
  }

  if (locale === "uk") {
    if (/^(привіт|привет|hi|hello)/i.test(t))
      return pickVariant(["Привіт! Я Pulse — підкажу про SYNC і чати. З чого почнемо?"], prevAssistant)
    if (/як\s+(твої\s+)?(справи|ти)/i.test(t))
      return pickVariant(
        ["Чую тебе. Розберемо чат або зв'язок — що саме хвилює?", "На зв'язку. Є діалог, який хочеш оживити?"],
        prevAssistant
      )
    return pickVariant(
      ["Чую тебе. Напиши, що саме хвилює — чат, матч чи профіль.", "Живий діалог піднімає SYNC швидше за очікування."],
      prevAssistant
    )
  }

  if (/^(hi|hello|hey)(?:\s|$|!|,|\.)/i.test(t) || /^(hi|hello|hey)$/i.test(t))
    return pickVariant(["Hi — I'm Pulse, your guide to sync and connections. What's on your mind?"], prevAssistant)
  if (/how are you|how('s| is) your/i.test(t))
    return pickVariant(
      ["I'm here and ready to help. What's going on with a match or chat?", "Doing well — tell me what you'd like to improve."],
      prevAssistant
    )
  return pickVariant(
    [
      "Tell me what's happening — a match, a quiet chat, or your profile.",
      "Quick, mutual replies are the fastest way to lift SYNC.",
    ],
    prevAssistant
  )
}

function sanitizeReply(reply: string, body: PulseChatBody, previous?: string): string {
  const trimmed = reply.trim()
  if (!trimmed || BANNED_REPLY_RE.test(trimmed)) {
    return localReply(body)
  }
  if (previous && trimmed === previous.trim()) {
    return localReply(body)
  }
  return trimmed.slice(0, 600)
}

function isBalanceError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { status?: number; message?: string }
  return e.status === 402 || Boolean(e.message?.includes("402") || e.message?.includes("Insufficient Balance"))
}

export async function generatePulseReply(
  input: unknown
): Promise<{ reply: string; source: "openrouter" | "local"; configured: boolean; billingBlocked?: boolean }> {
  const parsed = pulseChatBodySchema.safeParse(input)
  if (!parsed.success) {
    throw new Error("validation_error")
  }
  const body = { ...parsed.data, messages: normalizeMessages(parsed.data) }
  const locale = body.locale ?? "en"
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? ""
  const prevAssistant = [...body.messages].reverse().find((m) => m.role === "assistant")?.content
  const configured = isOpenRouterConfigured()

  if (!lastUser.trim()) {
    return { reply: localReply(body), source: "local", configured }
  }

  if (!configured) {
    return { reply: sanitizeReply(localReply(body), body, prevAssistant), source: "local", configured }
  }

  try {
    const client = getOpenRouterClient()
    const name = body.userName?.trim()
    const completion = await client.chat.completions.create({
      model: getOpenRouterModel(),
      temperature: 0.85,
      max_tokens: 380,
      messages: [
        { role: "system", content: SYSTEM[locale] ?? SYSTEM.en },
        ...(name ? [{ role: "system" as const, content: `User name: ${name}` }] : []),
        ...(prevAssistant
          ? [
              {
                role: "system" as const,
                content: `Do NOT repeat this previous reply: "${prevAssistant.slice(0, 200)}"`,
              },
            ]
          : []),
        ...body.messages.slice(-16).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content.slice(0, 2000),
        })),
      ],
    })
    const text = completion.choices[0]?.message?.content?.trim()
    if (!text) throw new Error("empty_response")
    return {
      reply: sanitizeReply(text, body, prevAssistant),
      source: "openrouter",
      configured,
    }
  } catch (err) {
    const billingBlocked = isBalanceError(err)
    if (!billingBlocked) {
      console.error("[ttm/pulse-chat]", err instanceof Error ? err.message : err)
    }
    return {
      reply: sanitizeReply(localReply(body), body, prevAssistant),
      source: "local",
      configured,
      billingBlocked,
    }
  }
}
