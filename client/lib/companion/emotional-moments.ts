import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import type { TranslationKey } from "@/client/lib/i18n"

export type EmotionalMomentKind = "peak" | "turning" | "attachment" | "sync_surge"

export type EmotionalMomentSignal = {
  kind: EmotionalMomentKind
  active: boolean
  titleKey: TranslationKey
  bodyKey: TranslationKey
  intensity: number
}

export function detectEmotionalMoment(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis,
  options?: { syncSurge?: boolean; recentActivity?: boolean }
): EmotionalMomentSignal | null {
  if (options?.syncSurge || (options?.recentActivity && analysis.syncPercent >= 85)) {
    return {
      kind: "sync_surge",
      active: true,
      titleKey: "compMomentSurgeTitle",
      bodyKey: "compMomentSurgeBody",
      intensity: 0.9,
    }
  }

  const top = intelligence.memories[0]
  if (top && top.importance >= 0.85) {
    return {
      kind: top.kind === "turning_point" ? "turning" : top.kind === "attachment" ? "attachment" : "peak",
      active: true,
      titleKey: top.titleKey,
      bodyKey: top.bodyKey,
      intensity: top.importance,
    }
  }

  if (analysis.chemistryPercent >= 82 && analysis.signals.messageCount >= 6) {
    return {
      kind: "peak",
      active: true,
      titleKey: "compMomentPeakTitle",
      bodyKey: "compMomentPeakBody",
      intensity: 0.82,
    }
  }

  return null
}
