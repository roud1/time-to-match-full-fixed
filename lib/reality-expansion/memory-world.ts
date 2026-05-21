import { getConnectionMemories } from "@/lib/connection-store"
import type { TranslationKey } from "@/lib/i18n"

export type MemoryFragment = {
  id: string
  weight: number
  echoKey: TranslationKey
}

export type MemoryWorldField = {
  fragmentCount: number
  atmosphereRemnant: number
  cinematicDepth: number
  fragments: MemoryFragment[]
  whisperKey: TranslationKey | null
}

export function analyzeMemoryWorldField(): MemoryWorldField {
  if (typeof window === "undefined") {
    return {
      fragmentCount: 0,
      atmosphereRemnant: 0,
      cinematicDepth: 0,
      fragments: [],
      whisperKey: null,
    }
  }

  const archived = getConnectionMemories()
  const fragments: MemoryFragment[] = archived.slice(0, 5).map((m, i) => ({
    id: `frag-${m.profileId}-${m.endedAt}`,
    weight: Math.max(0.35, 1 - i * 0.12),
    echoKey: m.reason === "faded" ? "erMemoryEchoFaded" : "erMemoryEchoEnded",
  }))

  const atmosphereRemnant = Math.min(1, 0.15 + archived.length * 0.1)
  const cinematicDepth = fragments.length > 0 ? 0.55 + fragments[0].weight * 0.35 : 0.2

  let whisperKey: TranslationKey | null = null
  if (archived.length >= 2) whisperKey = "erMemoryWorldRemnants"
  else if (archived.length === 1) whisperKey = "erMemoryWorldEcho"

  return {
    fragmentCount: fragments.length,
    atmosphereRemnant,
    cinematicDepth,
    fragments,
    whisperKey,
  }
}

export function memoryWorldCss(m: MemoryWorldField): Record<string, string> {
  return {
    "--er-memory-remnant": String(m.atmosphereRemnant),
    "--er-memory-cine": String(m.cinematicDepth),
  }
}
