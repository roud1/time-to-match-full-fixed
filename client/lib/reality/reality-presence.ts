import type { EmotionalCompanion } from "@/client/lib/companion"
import type { AtmosphereEvolution } from "@/client/lib/reality/atmosphere-evolution"
import type { TranslationKey } from "@/client/lib/i18n"

export type RealityPresenceLine = {
  id: string
  textKey: TranslationKey
}

export function buildRealityPresenceLine(
  companion: EmotionalCompanion | null,
  evolution: AtmosphereEvolution
): RealityPresenceLine | null {
  if (companion?.story) {
    return { id: `story-${companion.story.id}`, textKey: companion.story.headlineKey }
  }

  if (companion?.observation) {
    return { id: `obs-${companion.observation.kind}`, textKey: companion.observation.textKey }
  }

  return { id: `evolve-${evolution.phase}`, textKey: evolution.insightKey }
}
