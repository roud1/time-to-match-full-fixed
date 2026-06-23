import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import type { TranslationKey } from "@/client/lib/i18n"

export type TimeMemoryFragment = {
  id: string
  headlineKey: TranslationKey
  bodyKey: TranslationKey
  at: number
  weight: number
}

export function buildTimeMemories(
  profileId: number,
  messages: ChatMessage[],
  record: ConnectionRecord,
  analysis: ConnectionAnalysis
): TimeMemoryFragment[] {
  const items: TimeMemoryFragment[] = []
  const nights = messages.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= 22 || h < 5
  })

  if (nights.length >= 4) {
    items.push({
      id: `night-${profileId}`,
      headlineKey: "timeMemNightHead",
      bodyKey: "timeMemNightBody",
      at: nights[nights.length - 1].at,
      weight: 0.9,
    })
  }

  if (record.streakDays >= 3) {
    items.push({
      id: `stable-${profileId}-${record.streakDays}`,
      headlineKey: "timeMemStableHead",
      bodyKey: "timeMemStableBody",
      at: record.lastInteractionAt,
      weight: 0.75,
    })
  }

  if (analysis.momentum > 0.22) {
    items.push({
      id: `rhythm-${profileId}`,
      headlineKey: "timeMemRhythmHead",
      bodyKey: "timeMemRhythmBody",
      at: messages[messages.length - 1]?.at ?? record.lastInteractionAt,
      weight: 0.82,
    })
  }

  if (record.streakDays >= 1 && messages.length >= 8) {
    const bondDays = Math.max(1, Math.floor((Date.now() - record.matchedAt) / (24 * 60 * 60 * 1000)))
    if (bondDays >= 2) {
      items.push({
        id: `depth-${profileId}`,
        headlineKey: "timeMemDepthHead",
        bodyKey: "timeMemDepthBody",
        at: record.matchedAt + bondDays * 24 * 60 * 60 * 1000,
        weight: 0.7,
      })
    }
  }

  return items.sort((a, b) => b.weight - a.weight)
}
