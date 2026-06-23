import type { ChatMessage } from "@/client/lib/social-store"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { TranslationKey } from "@/client/lib/i18n"
import { getAIMemories } from "@/client/lib/ai-connection-memory-store"

export type MemoryIntelligenceKind = "peak" | "turning_point" | "attachment" | "deep_night"

export type MemoryIntelligenceHighlight = {
  id: string
  kind: MemoryIntelligenceKind
  at: number
  titleKey: TranslationKey
  bodyKey: TranslationKey
  importance: number
}

export function buildMemoryIntelligence(
  profileId: number,
  messages: ChatMessage[],
  record: ConnectionRecord,
  analysis: ConnectionAnalysis
): MemoryIntelligenceHighlight[] {
  const highlights: MemoryIntelligenceHighlight[] = []

  for (const ai of getAIMemories(profileId)) {
    highlights.push({
      id: `ai-${ai.id}`,
      kind: "peak",
      at: ai.at,
      titleKey: "intelMemoryPeak",
      bodyKey: "intelMemoryPeakBody",
      importance: ai.importance,
    })
  }

  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const nightCluster = sorted.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= 22 || h < 5
  })
  if (nightCluster.length >= 4) {
    const at = nightCluster[nightCluster.length - 1].at
    highlights.push({
      id: `night-${profileId}`,
      kind: "deep_night",
      at,
      titleKey: "intelMemoryNight",
      bodyKey: "intelMemoryNightBody",
      importance: 0.8,
    })
  }

  if (record.streakDays >= 5) {
    highlights.push({
      id: `attach-${profileId}`,
      kind: "attachment",
      at: record.lastInteractionAt,
      titleKey: "intelMemoryAttach",
      bodyKey: "intelMemoryAttachBody",
      importance: 0.88,
    })
  }

  if (analysis.chemistryPercent >= 80 && messages.length >= 8) {
    highlights.push({
      id: `turn-${profileId}`,
      kind: "turning_point",
      at: sorted[sorted.length - 1]?.at ?? Date.now(),
      titleKey: "intelMemoryTurn",
      bodyKey: "intelMemoryTurnBody",
      importance: 0.9,
    })
  }

  return highlights.sort((a, b) => b.importance - a.importance).slice(0, 4)
}
