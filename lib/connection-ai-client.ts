import type {
  AnalyzeConnectionRequest,
  ConnectionAIAnalysisResponse,
} from "@/lib/connection-ai-types"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord, ConnectionView } from "@/lib/connection-system"
import { extractSignals } from "@/lib/connection-engine"

const CACHE_MS = 45_000
const cache = new Map<string, { at: number; data: ConnectionAIAnalysisResponse }>()

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

function activityLevel(
  signals: ReturnType<typeof extractSignals>
): AnalyzeConnectionRequest["activityLevel"] {
  if (signals.messageCount >= 12 && signals.mutualSessions >= 1) return "high"
  if (signals.messageCount >= 4) return "medium"
  return "low"
}

export function buildAnalyzeConnectionRequest(
  profileId: number,
  locale: string,
  messages: ChatMessage[],
  record: ConnectionRecord,
  view: ConnectionView
): AnalyzeConnectionRequest {
  const signals = extractSignals(messages, record)
  return {
    profileId,
    locale: locale as AnalyzeConnectionRequest["locale"],
    messages: messages.slice(-30).map((m) => ({
      from: m.from,
      text: m.text,
      at: m.at,
    })),
    responseTimes: replyTimes(messages),
    activityLevel: activityLevel(signals),
    conversationLength: messages.length,
    mutualInteraction: view.bothParticipated,
    lateNightActivity: signals.nightMessageCount >= 2,
    stage: view.stage,
    streakDays: view.streakDays,
  }
}

/**
 * Calls server-side /api/analyze-connection — never touches API keys.
 */
export async function fetchConnectionAIAnalysis(
  body: AnalyzeConnectionRequest,
  opts?: { signal?: AbortSignal }
): Promise<ConnectionAIAnalysisResponse | null> {
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
    const data = (await res.json()) as ConnectionAIAnalysisResponse & { configured?: boolean }
    const result: ConnectionAIAnalysisResponse = {
      sync: data.sync,
      chemistry: data.chemistry,
      bond: data.bond,
      energy: data.energy,
      insight: data.insight,
      source: data.source,
      analyzedAt: data.analyzedAt ?? Date.now(),
    }
    cache.set(key, { at: Date.now(), data: result })
    return result
  } catch {
    return null
  }
}
