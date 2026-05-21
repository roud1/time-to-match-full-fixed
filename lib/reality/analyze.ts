import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { EmotionalCompanion } from "@/lib/companion"
import type { SyncMetrics } from "@/lib/sync-system"
import {
  resolveRelationshipEnvironment,
  environmentCss,
  environmentAttrs,
  type RelationshipEnvironment,
} from "@/lib/reality/relationship-environment"
import {
  deriveAtmosphereEvolution,
  evolutionCss,
  evolutionAttrs,
  type AtmosphereEvolution,
} from "@/lib/reality/atmosphere-evolution"
import {
  buildConnectionEnergy,
  energyCss,
  type ConnectionEnergyProfile,
} from "@/lib/reality/connection-energy"
import {
  resolveCinematicMoment,
  type CinematicMomentState,
} from "@/lib/reality/cinematic-moments"
import {
  buildRealityPresenceLine,
  type RealityPresenceLine,
} from "@/lib/reality/reality-presence"

export type EmotionalReality = {
  environment: RelationshipEnvironment
  evolution: AtmosphereEvolution
  energy: ConnectionEnergyProfile
  cinematic: CinematicMomentState | null
  presence: RealityPresenceLine | null
  style: Record<string, string>
  attrs: Record<string, string>
}

export function analyzeEmotionalReality(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis,
  companion: EmotionalCompanion | null,
  syncMetrics: SyncMetrics | null,
  options?: { syncSurge?: boolean }
): EmotionalReality {
  const environment = resolveRelationshipEnvironment(intelligence, analysis)
  const evolution = deriveAtmosphereEvolution(intelligence, analysis, environment, companion)
  const energy = buildConnectionEnergy(environment, evolution, analysis, syncMetrics)
  const cinematic = resolveCinematicMoment(analysis, companion, options)
  const presence = buildRealityPresenceLine(companion, evolution)

  return {
    environment,
    evolution,
    energy,
    cinematic,
    presence,
    style: {
      ...environmentCss(environment),
      ...evolutionCss(evolution),
      ...energyCss(energy),
    },
    attrs: {
      ...environmentAttrs(environment),
      ...evolutionAttrs(evolution),
      "data-reality-active": "true",
      "data-real-cinematic": cinematic?.kind ?? "none",
    },
  }
}
