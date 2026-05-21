import type { ConnectionAIAnalysisResponse } from "@/lib/connection-ai-types"
import {
  getOpenRouterClient,
  getOpenRouterModel,
  isOpenRouterConfigured,
} from "@/lib/server/openrouter"
import {
  analyzeConnectionBodySchema,
  connectionAIAnalysisSchema,
  type AnalyzeConnectionBody,
  type ConnectionAIAnalysisPayload,
} from "@/lib/server/validation/connection-ai"

function clamp(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)))
}

function localAnalysis(body: AnalyzeConnectionBody): ConnectionAIAnalysisResponse {
  const n = body.messages.length
  let sync = 12 + Math.min(40, n * 3)
  if (body.mutualInteraction) sync += 18
  if (body.activityLevel === "high") sync += 14
  else if (body.activityLevel === "medium") sync += 8
  if (body.lateNightActivity) sync += 8
  const fast = body.responseTimes.filter((t) => t > 0 && t < 8 * 60 * 1000).length
  sync += Math.min(12, fast * 2)
  if (!body.mutualInteraction) sync = clamp(sync * 0.55)

  let chemistry: ConnectionAIAnalysisPayload["chemistry"] = "low"
  if (sync >= 82) chemistry = "peak"
  else if (sync >= 58) chemistry = "high"
  else if (sync >= 32) chemistry = "medium"

  let bond: ConnectionAIAnalysisPayload["bond"] = "forming"
  if (body.streakDays && body.streakDays >= 7) bond = "deep"
  else if (sync >= 75) bond = "stable"
  else if (sync >= 45) bond = "growing"

  let energy: ConnectionAIAnalysisPayload["energy"] = "steady"
  if (body.activityLevel === "high" && body.mutualInteraction) energy = "growing"
  else if (!body.mutualInteraction || body.activityLevel === "low") energy = "cooling"

  const locale = body.locale ?? "en"
  const insights: Record<string, string> = {
    en: "Your rhythm together is shaping the connection — keep the thread alive.",
    ru: "Ваш общий ритм формирует связь — продолжайте диалог.",
    uk: "Ваш спільний ритм формує зв'язок — продовжуйте діалог.",
  }

  return {
    sync: clamp(sync),
    chemistry,
    bond,
    energy,
    insight: insights[locale] ?? insights.en,
    source: "local",
    analyzedAt: Date.now(),
  }
}

function buildPrompt(body: AnalyzeConnectionBody): string {
  const transcript = body.messages
    .slice(-20)
    .map((m) => {
      const role = m.from === "me" ? "User" : "Match"
      const text = m.text.slice(0, 400).replace(/\s+/g, " ").trim()
      return `${role}: ${text}`
    })
    .join("\n")

  const avgGap =
    body.responseTimes.length > 0
      ? Math.round(
          body.responseTimes.filter((t) => t > 0).reduce((a, b) => a + b, 0) /
            Math.max(1, body.responseTimes.filter((t) => t > 0).length) /
            1000 /
            60
        )
      : null

  return `You are the invisible emotional engine of Time to Match — a premium relationship operating system.
You are NOT a chatbot. You only analyze connection quality between two people and output JSON.

Signals:
- emotional depth (message substance, vulnerability, curiosity)
- chemistry (playfulness, warmth, mutual pull)
- engagement (message count, back-and-forth)
- response consistency (gaps in minutes: ${avgGap ?? "unknown"})
- connection growth (stage: ${body.stage ?? "spark"}, streak days: ${body.streakDays ?? 0})
- interaction intensity (activity: ${body.activityLevel}, mutual: ${body.mutualInteraction})

Metrics:
- conversation length: ${body.conversationLength} messages
- late-night activity: ${body.lateNightActivity}
- mutual interaction: ${body.mutualInteraction}

Recent transcript:
${transcript || "(no messages yet)"}

Return ONLY valid JSON:
{
  "sync": <integer 0-100>,
  "chemistry": "low" | "medium" | "high" | "peak",
  "bond": "forming" | "growing" | "stable" | "deep",
  "energy": "growing" | "steady" | "cooling" | "fading",
  "insight": "<one atmospheric sentence, max 120 chars, intimate premium tone, locale: ${body.locale ?? "en"}>"
}

Penalize one-sided threads and long cold gaps. Reward mutual energy, depth, and late-night intimacy.`
}

async function analyzeWithOpenRouter(
  body: AnalyzeConnectionBody
): Promise<ConnectionAIAnalysisResponse> {
  const client = getOpenRouterClient()
  const completion = await client.chat.completions.create({
    model: getOpenRouterModel(),
    temperature: 0.35,
    max_tokens: 320,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You analyze romantic connection quality for a premium dating platform. Output only JSON. Never mention AI, models, or APIs.",
      },
      { role: "user", content: buildPrompt(body) },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim()
  if (!raw) throw new Error("empty_model_response")

  const parsed = connectionAIAnalysisSchema.parse(JSON.parse(raw))
  return {
    sync: clamp(parsed.sync),
    chemistry: parsed.chemistry,
    bond: parsed.bond,
    energy: parsed.energy,
    insight: parsed.insight.slice(0, 280),
    source: "openrouter",
    analyzedAt: Date.now(),
  }
}

export async function analyzeConnectionOnServer(
  input: unknown
): Promise<{ ok: true; data: ConnectionAIAnalysisResponse } | { ok: false; error: string }> {
  const parsed = analyzeConnectionBodySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "validation_error" }
  }

  const body = parsed.data

  if (!isOpenRouterConfigured()) {
    return { ok: true, data: localAnalysis(body) }
  }

  try {
    const data = await analyzeWithOpenRouter(body)
    return { ok: true, data }
  } catch (err) {
    console.error(
      "[ttm/connection-ai] OpenRouter failed, using local fallback:",
      err instanceof Error ? err.message : err
    )
    return { ok: true, data: localAnalysis(body) }
  }
}
