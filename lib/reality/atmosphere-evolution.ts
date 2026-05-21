import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { EmotionalCompanion } from "@/lib/companion"
import type { TranslationKey } from "@/lib/i18n"
import type { RelationshipEnvironment } from "@/lib/reality/relationship-environment"

export type AtmosphereEvolutionPhase = "warming" | "steady" | "cooling" | "surging"

export type AtmosphereEvolution = {
  phase: AtmosphereEvolutionPhase
  drift: number
  warmth: number
  intensity: number
  insightKey: TranslationKey
}

export function deriveAtmosphereEvolution(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis,
  environment: RelationshipEnvironment,
  companion: EmotionalCompanion | null
): AtmosphereEvolution {
  const { forecast, rhythm } = intelligence
  let phase: AtmosphereEvolutionPhase = "steady"
  let insightKey: TranslationKey = "realEvolveSteady"

  if (analysis.momentum > 0.25 || companion?.moment?.kind === "sync_surge") {
    phase = "surging"
    insightKey = "realEvolveSurge"
  } else if (forecast.tone === "rising" || rhythm.type === "intense_chemistry") {
    phase = "warming"
    insightKey = "realEvolveWarm"
  } else if (forecast.tone === "softening" || environment.id === "fading_distance") {
    phase = "cooling"
    insightKey = "realEvolveCool"
  }

  const warmth =
    environment.glow * 0.6 +
    (forecast.tone === "rising" ? 0.25 : 0) +
    (forecast.tone === "softening" ? -0.2 : 0)

  const intensity = Math.min(
    1,
    environment.depth * 0.5 + analysis.chemistryPercent / 140 + (phase === "surging" ? 0.2 : 0)
  )

  return {
    phase,
    drift: analysis.momentum,
    warmth: Math.max(0.1, Math.min(1, warmth)),
    intensity,
    insightKey,
  }
}

export function evolutionCss(evolution: AtmosphereEvolution): Record<string, string> {
  return {
    "--real-warmth": String(evolution.warmth),
    "--real-intensity": String(evolution.intensity),
    "--real-drift": String(evolution.drift),
  }
}

export function evolutionAttrs(evolution: AtmosphereEvolution): Record<string, string> {
  return {
    "data-real-phase": evolution.phase,
  }
}
