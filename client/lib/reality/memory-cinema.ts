import type { EcosystemMemoryItem } from "@/client/lib/ecosystem/memory-items"
import type { TranslationKey } from "@/client/lib/i18n"

export type RealityMemoryEntry = EcosystemMemoryItem & {
  summaryKey: TranslationKey
  cinematicWeight: number
}

export function enrichMemoryForReality(item: EcosystemMemoryItem): RealityMemoryEntry {
  let summaryKey: TranslationKey = "realMemSummaryDefault"
  let cinematicWeight = 0.5

  if (item.kind === "ai") {
    summaryKey = "realMemSummaryAi"
    cinematicWeight = 0.85
  } else if (item.kind === "moment") {
    summaryKey = "realMemSummaryMoment"
    cinematicWeight = 0.92
  } else if (item.featured) {
    summaryKey = "realMemSummaryFeatured"
    cinematicWeight = 0.78
  }

  if (item.stage === "emotional_resonance" || item.stage === "deep_chemistry") {
    summaryKey = "realMemSummaryDeep"
    cinematicWeight = Math.min(1, cinematicWeight + 0.1)
  }

  return { ...item, summaryKey, cinematicWeight }
}

export function enrichMemoriesForReality(items: EcosystemMemoryItem[]): RealityMemoryEntry[] {
  return items.map(enrichMemoryForReality)
}
