import type {
  AnalyzeConnectionRequest,
  AIConnectionAnalysis,
} from "@/client/lib/connection-ai-types"
import type { ChatMessage } from "@/client/lib/social-store"
import type { ConnectionRecord, ConnectionView } from "@/client/lib/connection-system"
import { extractAIConnectionSignals, activityLevelFromSignals } from "@/client/lib/ai-connection-engine"

const CACHE_MS = 40_000
const cache = new Map<string, { at: number; data: AIConnectionAnalysis }>()

function cacheKey(profileId: number, messageCount: number, lastAt: number) {
  return `${profileId}:${messageCount}:${lastAt}`
}

function replyTimes(messages: ChatMessage[]): number[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const times: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].from !== sorted[i].from) {
      times.push(sorted[i].at - sorted[i - 1].at)
    }
  }
  return times
}

export function buildAnalyzeConnectionRequest(
  profileId: number,
  locale: string,
  messages: ChatMessage[],
  record: ConnectionRecord,
  view: ConnectionView
): AnalyzeConnectionRequest {
  const signals = extractAIConnectionSignals(messages, record)
  return {
    profileId,
    locale: locale as AnalyzeConnectionRequest["locale"],
    messages: messages
      .slice(-30)
      .filter((m): m is ChatMessage & { from: "me" | "them" } => m.from !== "system")
      .map((m) => ({
        from: m.from,
        text: m.text,
        at: m.at,
      })),
    responseTimes: replyTimes(messages),
    activityLevel: activityLevelFromSignals(signals),
    conversationLength: messages.length,
    mutualInteraction: view.bothParticipated,
    lateNightActivity: signals.lateNightRatio >= 0.2 && signals.messageCount >= 3,
    stage: view.stage,
    streakDays: view.streakDays,
    signals,
  }
}

/**
 * Invisible AI analysis — POST /api/analyze-connection (no API keys on client).
 */
export async function fetchConnectionAIAnalysis(
  body: AnalyzeConnectionRequest,
  opts?: { signal?: AbortSignal }
): Promise<AIConnectionAnalysis | null> {
  const last = body.messages[body.messages.length - 1]?.at ?? 0
  const key = cacheKey(body.profileId, body.messages.length, last)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data

  try {
    const res = await fetch("/api/analyze-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: opts?.signal,
    })
    if (!res.ok) return null
    const data = (await res.json()) as AIConnectionAnalysis & {
      configured?: boolean
      provider?: string
    }
    const result: AIConnectionAnalysis = {
      sync: data.sync,
      chemistry: data.chemistry,
      bond: data.bond,
      energy: data.energy,
      emotionalState: data.emotionalState ?? "curious",
      connectionState: data.connectionState ?? "growing_connection",
      personality: data.personality ?? "slow_burn",
      insight: data.insight,
      atmosphereLevel: data.atmosphereLevel ?? data.sync,
      memories: data.memories ?? [],
      source: data.source ?? "local",
      analyzedAt: data.analyzedAt ?? Date.now(),
    }
    cache.set(key, { at: Date.now(), data: result })
    return result
  } catch {
    return null
  }
}
