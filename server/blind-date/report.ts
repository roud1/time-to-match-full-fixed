/**
 * Connection Report after a blind date — one per person, generated once and cached.
 *
 * Local part (always, free): facts only — time, message counts, shared progress, shared interests,
 * same answers in games, conversation starters built from them. It does not read message content.
 *
 * AI part (optional): only when BOTH people turned on "AI tips" (profile.aiInsightsConsent), a
 * provider is configured and the daily limits allow it. Only then is the conversation sent, with
 * "Me" / "Them" instead of names. The reply is validated and filtered: no diagnoses, no
 * compatibility percentages. Any failure falls back to the local report.
 */

import { ROOM_DURATION_MS } from "@/server/blind-date/rules"
import { z } from "zod"
import { getDb } from "@/server/db"
import { log } from "@/server/log"
import { bothConsentToAiInsights } from "@/server/ai-consent"
import { aiBudgetAvailable, extractJsonObject, getAiProvider, recordAiUsage } from "@/server/ai/provider"
import { getRoomForUser, roomSide, revealState, type RoomRow } from "@/server/blind-date/service"
import type { GameKey } from "@/server/blind-date/games/catalog"
import type { GameResult, GameState } from "@/server/blind-date/games/engine"
import gameTexts from "@/client/lib/blind-date-games-text.json"

export const REPORT_FEATURE = "blind_date_report"
const MIN_MESSAGES_FOR_AI = 4

export type Starter =
  | { kind: "interest"; slug: string }
  | { kind: "answer"; prompt: string; option: number }
  | { kind: "generic"; id: number }

export type AiStatus = "ok" | "no_consent" | "unavailable" | "limit" | "too_short" | "failed"

export type ConnectionReport = {
  source: "local" | "ai"
  aiStatus: AiStatus
  /** Whether I turned on AI tips myself (the other person's setting is not disclosed). */
  myAiConsent: boolean
  minutes: number
  messages: { mine: number; theirs: number }
  progress: number
  sharedInterests: string[]
  games: { key: GameKey; category: string | null; result: GameResult | null }[]
  sameAnswers: { prompt: string; option: number }[]
  starters: Starter[]
  ai: null | { summary: string | null; themes: string[]; starters: string[] }
  locale: string
  createdAt: string
}

const LANGUAGE_NAMES: Record<string, string> = {
  ru: "Russian",
  uk: "Ukrainian",
  en: "English",
  de: "German",
  es: "Spanish",
  pl: "Polish",
  fr: "French",
  it: "Italian",
  tr: "Turkish",
}

type Sql = NonNullable<ReturnType<typeof getDb>>

function db(): Sql {
  const sql = getDb()
  if (!sql) throw new Error("database_unavailable")
  return sql
}

// ───────────────────────── AI output safety ─────────────────────────

const BANNED = new RegExp(
  [
    "\\d+\\s?%",
    "diagnos",
    "disorder",
    "narciss",
    "depress",
    "bipolar",
    "adhd",
    "autis",
    "borderline",
    "psychopath",
    "toxic",
    "red flag",
    "attachment style",
    "soulmate",
    "диагноз",
    "расстройств",
    "нарцисс",
    "депресс",
    "биполяр",
    "сдвг",
    "аутиз",
    "пограничн",
    "токсичн",
    "абьюз",
    "психопат",
  ].join("|"),
  "i"
)

const aiSchema = z.object({
  summary: z.string().max(600).optional().nullable(),
  themes: z.array(z.string().max(80)).max(6).optional().default([]),
  starters: z.array(z.string().max(200)).max(6).optional().default([]),
})

/** Validates the model reply and removes anything that sounds like a diagnosis or a score. */
export function sanitizeAiReport(raw: unknown): ConnectionReport["ai"] {
  const parsed = aiSchema.safeParse(raw)
  if (!parsed.success) return null
  const clean = (s: string) => s.replace(/\s+/g, " ").trim()
  const ok = (s: string) => s.length > 0 && !BANNED.test(s) && !/https?:\/\//i.test(s)
  const summary = parsed.data.summary ? clean(parsed.data.summary) : null
  const result = {
    summary: summary && ok(summary) ? summary : null,
    themes: parsed.data.themes.map(clean).filter(ok).slice(0, 3),
    starters: parsed.data.starters.map(clean).filter(ok).slice(0, 3),
  }
  if (!result.summary && result.themes.length === 0 && result.starters.length === 0) return null
  return result
}

// ───────────────────────── local facts ─────────────────────────

type GameRow = { game_key: GameKey; status: string; state: GameState; result: GameResult | null }

function sameAnswersFrom(games: GameRow[]): { prompt: string; option: number }[] {
  const out: { prompt: string; option: number }[] = []
  for (const g of games) {
    g.state.rounds.forEach((round, i) => {
      const rec = g.state.records[i]
      if (round.kind !== "choice" || rec?.skipped || rec?.a?.choice === undefined) return
      if (rec.a.choice === rec.b?.choice) out.push({ prompt: round.prompt, option: rec.a.choice })
    })
  }
  return out
}

function startersFrom(same: { prompt: string; option: number }[], interests: string[]): Starter[] {
  const starters: Starter[] = []
  for (const s of same.slice(0, 2)) starters.push({ kind: "answer", ...s })
  for (const slug of interests) {
    if (starters.length >= 3) break
    starters.push({ kind: "interest", slug })
  }
  for (let id = 1; starters.length < 3; id++) starters.push({ kind: "generic", id })
  return starters
}

function englishPrompt(prompt: string, option?: number): string {
  const p = (gameTexts as Record<string, { prompts: Record<string, { q: string; o: string[] }> }>).en.prompts[prompt]
  if (!p) return prompt
  return option === undefined ? p.q : `${p.q} → ${p.o[option] ?? option}`
}

// ───────────────────────── report ─────────────────────────

export type ReportError = "not_found" | "not_ready" | "unavailable"

export async function getConnectionReport(
  roomId: string,
  userId: string,
  locale: string
): Promise<{ ok: true; report: ConnectionReport } | { ok: false; code: ReportError }> {
  const room = await getRoomForUser(roomId, userId)
  if (!room) return { ok: false, code: "not_found" }
  if (room.status === "active") return { ok: false, code: "not_ready" }
  if (room.close_reason === "reported") return { ok: false, code: "unavailable" }

  const sql = db()
  const [cached] = await sql<{ report: ConnectionReport }[]>`
    SELECT report FROM blind_date_connection_reports WHERE room_id = ${roomId} AND user_id = ${userId}
  `
  if (cached) return { ok: true, report: cached.report }

  const report = await buildReport(room, userId, locale)
  await sql`
    INSERT INTO blind_date_connection_reports (room_id, user_id, source, report)
    VALUES (${roomId}, ${userId}, ${report.source}, ${sql.json(report as never)})
    ON CONFLICT (room_id, user_id) DO NOTHING
  `
  const [stored] = await sql<{ report: ConnectionReport }[]>`
    SELECT report FROM blind_date_connection_reports WHERE room_id = ${roomId} AND user_id = ${userId}
  `
  return { ok: true, report: stored?.report ?? report }
}

async function buildReport(room: RoomRow, userId: string, locale: string): Promise<ConnectionReport> {
  const sql = db()
  const me = roomSide(room, userId)!
  const peerId = me === "a" ? room.user_b : room.user_a

  const messages = await sql<{ sender_id: string; body: string }[]>`
    SELECT sender_id, body FROM blind_date_messages WHERE room_id = ${room.id} ORDER BY id
  `
  const interests = await sql<{ slug: string | null; name: string }[]>`
    SELECT i.slug, i.name FROM user_interests a
    JOIN user_interests b ON a.interest_id = b.interest_id
    JOIN interests i ON i.id = a.interest_id
    WHERE a.user_id = ${userId} AND b.user_id = ${peerId}
    ORDER BY i.name LIMIT 8
  `
  const games = await sql<GameRow[]>`
    SELECT game_key, status, state, result FROM blind_date_game_sessions
    WHERE room_id = ${room.id} ORDER BY created_at
  `
  const { progress } = await revealState(room)
  const finished = games.filter((g) => g.status === "completed")
  const sharedInterests = interests.map((i) => i.slug ?? i.name)
  const sameAnswers = sameAnswersFrom(finished)
  const end = Math.min(Date.now(), room.ends_at.getTime(), room.closed_at?.getTime() ?? Infinity)
  const mine = messages.filter((m) => m.sender_id === userId).length

  const [consentRow] = await sql<{ consent: string | null }[]>`
    SELECT profile->>'aiInsightsConsent' AS consent FROM users WHERE id = ${userId}
  `
  const base: ConnectionReport = {
    source: "local",
    aiStatus: "no_consent",
    myAiConsent: consentRow?.consent === "true",
    minutes: Math.max(0, Math.round((end - room.started_at.getTime()) / 60000)),
    messages: { mine, theirs: messages.length - mine },
    progress,
    sharedInterests,
    games: finished.map((g) => ({ key: g.game_key, category: g.state.category ?? null, result: g.result })),
    sameAnswers,
    starters: startersFrom(sameAnswers, sharedInterests),
    ai: null,
    locale,
    createdAt: new Date().toISOString(),
  }

  // ── AI part: only with consent from both people ──
  if (!(await bothConsentToAiInsights(room.user_a, room.user_b))) return base
  const provider = getAiProvider()
  if (!provider) return { ...base, aiStatus: "unavailable" }
  if (messages.length < MIN_MESSAGES_FOR_AI) return { ...base, aiStatus: "too_short" }
  if (!(await aiBudgetAvailable(userId, REPORT_FEATURE))) return { ...base, aiStatus: "limit" }

  const transcript = messages
    .slice(-80)
    .map((m) => `${m.sender_id === userId ? "Me" : "Them"}: ${m.body.slice(0, 300)}`)
    .join("\n")
  const gameLines = sameAnswers.map((s) => `Both chose: ${englishPrompt(s.prompt, s.option)}`).join("\n")
  const language = LANGUAGE_NAMES[locale] ?? "English"

  const system = [
    `You help two adults who just had a ${Math.round(ROOM_DURATION_MS / 60_000)}-minute anonymous text date in a dating app.`,
    `Write for the person called "Me", in ${language}, warm and short.`,
    "Rules: base everything only on the conversation and game answers given.",
    "Never diagnose or label personality, mental health or attachment styles.",
    "Never give compatibility scores, percentages or predictions; never claim scientific accuracy.",
    "Do not repeat private details such as places of work, addresses or contacts.",
    'Reply with JSON only: {"summary": string (max 2 sentences about what the conversation was like),',
    '"themes": string[] (max 3 short topics you both enjoyed), "starters": string[] (max 3 questions Me could ask next)}.',
  ].join(" ")
  const user = [`Conversation:\n${transcript}`, gameLines ? `Game answers:\n${gameLines}` : ""].filter(Boolean).join("\n\n")

  try {
    const completion = await provider.complete({ system, user, maxTokens: 500, timeoutMs: 20_000 })
    await recordAiUsage({ userId, feature: REPORT_FEATURE, completion })
    const ai = sanitizeAiReport(extractJsonObject(completion.text))
    if (!ai) return { ...base, aiStatus: "failed" }
    return { ...base, source: "ai", aiStatus: "ok", ai }
  } catch (err) {
    await recordAiUsage({ userId, feature: REPORT_FEATURE, completion: null, provider: provider.name })
    log.warn("blind_date_report_ai_failed", { roomId: room.id, err: err instanceof Error ? err.message : String(err) })
    return { ...base, aiStatus: "failed" }
  }
}
