import { getConnectionMemories, getActiveConnections } from "@/lib/connection-store"
import type { TranslationKey } from "@/lib/i18n"

/** Emotional memory field — archives as living world atmosphere. */
export type EmotionalMemoryField = {
  archiveCount: number
  cinematicWeight: number
  storytellingKey: TranslationKey | null
  atmosphereRecall: number
}

export function analyzeEmotionalMemoryField(): EmotionalMemoryField {
  if (typeof window === "undefined") {
    return { archiveCount: 0, cinematicWeight: 0, storytellingKey: null, atmosphereRecall: 0 }
  }

  const archived = getConnectionMemories()
  const active = getActiveConnections().length
  const cinematicWeight = Math.min(
    1,
    0.25 + archived.length * 0.12 + active * 0.06
  )

  let storytellingKey: TranslationKey | null = null
  if (archived.length >= 3) storytellingKey = "eoMemoryArchiveDeep"
  else if (archived.length >= 1) storytellingKey = "eoMemoryArchive"
  else if (active >= 2) storytellingKey = "eoMemoryMoments"

  return {
    archiveCount: archived.length,
    cinematicWeight,
    storytellingKey,
    atmosphereRecall: Math.min(1, 0.18 + cinematicWeight * 0.62),
  }
}

export function memoryFieldCss(m: EmotionalMemoryField): Record<string, string> {
  return {
    "--eo-memory-weight": String(m.cinematicWeight),
    "--eo-memory-recall": String(m.atmosphereRecall),
  }
}
