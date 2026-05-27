import type { AIConnectionAnalysis } from "@/lib/ai-connection-engine/types"
import { aiMemoryLabel } from "@/lib/server/ai-memory-labels"
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

function normalizeChemistry(c: ConnectionAIAnalysisPayload["chemistry"]) {
  return c === "intense" ? "peak" : c
}

function localAnalysis(body: AnalyzeConnectionBody): AIConnectionAnalysis {
  const s = body.signals
  const n = body.messages.length
  let sync = 12 + Math.min(38, n * 2.5)
  if (body.mutualInteraction) sync += 16
  if (body.activityLevel === "high") sync += 14
  else if (body.activityLevel === "medium") sync += 7
  if (body.lateNightActivity) sync += 7
  if (s) {
    sync += Math.min(14, s.fastReplyCount * 2)
    sync += Math.round(s.mutualEngagement * 12)
    sync += Math.round(s.interactionDepth * 0.12)
    sync -= Math.round(s.oneSidedRatio * 22)
    sync += Math.round(s.dailyConsistency * 8)
  }
  const fast = body.responseTimes.filter((t) => t > 0 && t < 8 * 60 * 1000).length
  sync += Math.min(10, fast * 2)
  if (!body.mutualInteraction) sync = clamp(sync * 0.52)

  const chemistry: AIConnectionAnalysis["chemistry"] =
    sync >= 82 ? "peak" : sync >= 58 ? "high" : sync >= 32 ? "medium" : "low"

  let bond: AIConnectionAnalysis["bond"] = "forming"
  if (body.streakDays && body.streakDays >= 7) bond = "deep"
  else if (sync >= 75) bond = "stable"
  else if (sync >= 45) bond = "growing"

  let energy: AIConnectionAnalysis["energy"] = "steady"
  if (body.activityLevel === "high" && body.mutualInteraction) energy = "growing"
  else if (!body.mutualInteraction || body.activityLevel === "low") energy = "cooling"

  let emotionalState: AIConnectionAnalysis["emotionalState"] = "curious"
  if (energy === "cooling") emotionalState = "fading"
  else if (!body.mutualInteraction) emotionalState = "distant"
  else if (sync >= 85) emotionalState = "aligned"
  else if (chemistry === "peak") emotionalState = "deepening"
  else if (bond === "stable" || bond === "deep") emotionalState = "warming"

  let connectionState: AIConnectionAnalysis["connectionState"] = "growing_connection"
  if (emotionalState === "fading") connectionState = "fading_energy"
  else if (emotionalState === "distant") connectionState = "emotional_tension"
  else if (chemistry === "peak") connectionState = "deep_chemistry"
  else if (bond === "stable" || bond === "deep") connectionState = "stable_bond"
  else if (sync >= 80) connectionState = "high_compatibility"

  let personality: AIConnectionAnalysis["personality"] = "slow_burn"
  if (body.lateNightActivity && s && s.lateNightRatio >= 0.25) personality = "night_energy"
  else if (chemistry === "peak") personality = "intense_attraction"
  else if (sync >= 78 && bond !== "forming") personality = "deep_sync"
  else if (s && s.oneSidedRatio > 0.55) personality = "emotional_chaos"
  else if (bond === "stable") personality = "stable_bond"
  else if (bond === "deep") personality = "calm_connection"
  else if (chemistry === "high") personality = "magnetic_chemistry"

  const locale = body.locale ?? "ru"
  const insights: Record<string, string> = {
    en: "Your connection became more stable — the rhythm feels intentional.",
    ru: "Связь стала стабильнее — ритм ощущается осознанным.",
    uk: "Зв'язок став стабільнішим — ритм відчувається свідомим.",
  }

  const memories: AIConnectionAnalysis["memories"] = []
  if (body.lateNightActivity && n >= 4) {
    memories.push({
      id: "long_night",
      at: body.messages[body.messages.length - 1]?.at ?? Date.now(),
      label: aiMemoryLabel(locale, "long_night"),
      importance: 0.8,
    })
  }
  if (n >= 12) {
    memories.push({
      id: "first_deep_talk",
      at: body.messages[Math.min(11, n - 1)]?.at ?? Date.now(),
      label: aiMemoryLabel(locale, "first_deep_talk"),
      importance: 0.85,
    })
  }

  return {
    sync: clamp(sync),
    chemistry,
    bond,
    energy,
    emotionalState,
    connectionState,
    personality,
    insight: insights[locale] ?? insights.ru ?? insights.en,
    atmosphereLevel: clamp(sync * 0.92 + (energy === "growing" ? 8 : 0)),
    memories,
    source: "local",
    analyzedAt: Date.now(),
  }
}

function buildPrompt(body: AnalyzeConnectionBody): string {
  const transcript = body.messages
    .slice(-24)
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

  const sig = body.signals
  const signalBlock = sig
    ? `
Structured signals:
- avg reply gap (ms): ${sig.avgReplyMs ?? "n/a"}
- median reply gap (ms): ${sig.medianReplyMs ?? "n/a"}
- reply consistency (0-1): ${sig.replyConsistency.toFixed(2)}
- avg message length: ${sig.avgMessageLength}
- interaction depth (0-100): ${sig.interactionDepth}
- mutual engagement (0-1): ${sig.mutualEngagement.toFixed(2)}
- late night ratio: ${sig.lateNightRatio.toFixed(2)}
- daily consistency (0-1): ${sig.dailyConsistency.toFixed(2)}
- emotional intensity (0-100): ${sig.emotionalIntensity}
- one-sided ratio: ${sig.oneSidedRatio.toFixed(2)}
- session depth (msgs in peak session): ${sig.sessionDepth}
- fast replies: ${sig.fastReplyCount}`
    : ""

  return `You are the invisible emotional intelligence of Time to Match — a relationship operating system.
You are NOT a chatbot. Never greet, never advise as an assistant. Only analyze the bond between two people.

Analyze:
- communication style (warmth, playfulness, depth)
- activity & engagement patterns
- response speed & consistency (avg gap minutes: ${avgGap ?? "unknown"})
- chemistry & emotional pull
- bond stability & growth
- late-night intimacy
- daily consistency (streak: ${body.streakDays ?? 0} days)
${signalBlock}

Context: stage=${body.stage ?? "spark"}, messages=${body.conversationLength}, mutual=${body.mutualInteraction}, activity=${body.activityLevel}, lateNight=${body.lateNightActivity}

Transcript:
${transcript || "(empty)"}

Return ONLY valid JSON (locale for insight: ${body.locale ?? "ru"}):
{
  "sync": <0-100 integer>,
  "chemistry": "low"|"medium"|"high"|"peak"|"intense",
  "bond": "forming"|"growing"|"stable"|"deep",
  "energy": "growing"|"steady"|"cooling"|"fading",
  "emotionalState": "curious"|"warming"|"deepening"|"aligned"|"tension"|"distant"|"fading",
  "connectionState": "growing_connection"|"stable_bond"|"deep_chemistry"|"emotional_tension"|"fading_energy"|"high_compatibility",
  "personality": "slow_burn"|"deep_sync"|"emotional_chaos"|"calm_connection"|"magnetic_chemistry"|"night_energy"|"stable_bond"|"intense_attraction",
  "insight": "<one premium atmospheric sentence, max 120 chars, no AI mentions>",
  "atmosphereLevel": <0-100 how alive/vibrant the UI should feel>,
  "memories": [{"id":"first_deep_talk"|"long_night"|"high_interaction"|"strong_chemistry","at":<unix_ms>,"label":"<short>","importance":<0-1>}]
}

Penalize one-sided threads and cold gaps. Reward mutual depth, fast replies, and night intimacy.`
}

function payloadToAnalysis(
  parsed: ConnectionAIAnalysisPayload,
  source: AIConnectionAnalysis["source"]
): AIConnectionAnalysis {
  const chemistry = normalizeChemistry(parsed.chemistry)
  return {
    sync: clamp(parsed.sync),
    chemistry: chemistry as AIConnectionAnalysis["chemistry"],
    bond: parsed.bond,
    energy: parsed.energy,
    emotionalState: parsed.emotionalState,
    connectionState: parsed.connectionState,
    personality: parsed.personality,
    insight: parsed.insight.slice(0, 280),
    atmosphereLevel: clamp(parsed.atmosphereLevel ?? parsed.sync),
    memories: parsed.memories ?? [],
    source,
    analyzedAt: Date.now(),
  }
}

async function analyzeWithOpenRouter(body: AnalyzeConnectionBody): Promise<AIConnectionAnalysis> {
  const client = getOpenRouterClient()
  const completion = await client.chat.completions.create({
    model: getOpenRouterModel(),
    temperature: 0.32,
    max_tokens: 480,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an invisible relationship analyzer for a premium platform. Output JSON only. Never mention AI, bots, or models.",
      },
      { role: "user", content: buildPrompt(body) },
    ],
  })

  const raw = completion.choices[0]?.message?.content?.trim()
  if (!raw) throw new Error("empty_model_response")

  const parsed = connectionAIAnalysisSchema.parse(JSON.parse(raw))
  return payloadToAnalysis(parsed, "openrouter")
}

export async function analyzeConnectionOnServer(
  input: unknown
): Promise<{ ok: true; data: AIConnectionAnalysis } | { ok: false; error: string }> {
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
