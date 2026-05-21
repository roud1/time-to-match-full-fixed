import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { AIMemoryMoment, AIMemoryType } from "@/lib/ai-connection-engine/types"
import type { AIConnectionSignals } from "@/lib/ai-connection-engine/types"
import type { TranslationKey } from "@/lib/i18n"

const NIGHT_START = 22
const NIGHT_END = 5

function isNightHour(ts: number) {
  const h = new Date(ts).getHours()
  return h >= NIGHT_START || h < NIGHT_END
}

const MEMORY_LABEL: Record<AIMemoryType, TranslationKey> = {
  first_deep_talk: "aiMemoryFirstDeep",
  long_night: "aiMemoryLongNight",
  high_interaction: "aiMemoryHighInteraction",
  strong_chemistry: "aiMemoryStrongChemistry",
}

function sessionPeak(messages: ChatMessage[]): number {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const GAP = 35 * 60 * 1000
  let peak = 0
  let count = 0
  let last = 0
  for (const m of sorted) {
    if (last && m.at - last > GAP) peak = Math.max(peak, count)
    count += 1
    last = m.at
  }
  return Math.max(peak, count)
}

/** Detect milestone moments for AI memory (client-side). */
export function detectAIMemories(
  messages: ChatMessage[],
  record: ConnectionRecord,
  signals: AIConnectionSignals,
  syncPercent: number,
  t: (key: TranslationKey) => string
): AIMemoryMoment[] {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const out: AIMemoryMoment[] = []

  const deepAt = sessionPeak(messages) >= 12 ? sorted[Math.min(11, sorted.length - 1)]?.at : undefined
  if (deepAt) {
    out.push({
      id: "first_deep_talk",
      at: deepAt,
      label: t(MEMORY_LABEL.first_deep_talk),
      importance: 0.85,
    })
  }

  const nightMsgs = sorted.filter((m) => isNightHour(m.at))
  const nightMe = nightMsgs.some((m) => m.from === "me")
  const nightThem = nightMsgs.some((m) => m.from === "them")
  if (nightMsgs.length >= 4 && nightMe && nightThem) {
    out.push({
      id: "long_night",
      at: nightMsgs[nightMsgs.length - 1].at,
      label: t(MEMORY_LABEL.long_night),
      importance: 0.8,
    })
  }

  if (signals.messageCount >= 20 && signals.mutualEngagement >= 0.5) {
    out.push({
      id: "high_interaction",
      at: sorted[sorted.length - 1]?.at ?? record.matchedAt,
      label: t(MEMORY_LABEL.high_interaction),
      importance: 0.75,
    })
  }

  if (syncPercent >= 72 && signals.emotionalIntensity >= 55) {
    out.push({
      id: "strong_chemistry",
      at: sorted[sorted.length - 1]?.at ?? Date.now(),
      label: t(MEMORY_LABEL.strong_chemistry),
      importance: 0.9,
    })
  }

  return out.sort((a, b) => a.at - b.at)
}

export function mergeAIMemories(
  detected: AIMemoryMoment[],
  fromAI: AIMemoryMoment[]
): AIMemoryMoment[] {
  const byId = new Map<AIMemoryType, AIMemoryMoment>()
  for (const m of detected) byId.set(m.id, m)
  for (const m of fromAI) {
    const prev = byId.get(m.id)
    if (!prev || m.importance >= prev.importance) byId.set(m.id, m)
  }
  return [...byId.values()].sort((a, b) => a.at - b.at)
}
