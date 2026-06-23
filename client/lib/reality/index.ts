/**
 * Phase 16 — Emotional Reality Layer (living digital relationship space).
 */
export {
  type RelationshipEnvironmentId,
  type RelationshipEnvironment,
  resolveRelationshipEnvironment,
  environmentCss,
  environmentAttrs,
} from "@/client/lib/reality/relationship-environment"

export {
  type AtmosphereEvolutionPhase,
  type AtmosphereEvolution,
  deriveAtmosphereEvolution,
  evolutionCss,
  evolutionAttrs,
} from "@/client/lib/reality/atmosphere-evolution"

export {
  type ConnectionEnergyProfile,
  buildConnectionEnergy,
  energyCss,
} from "@/client/lib/reality/connection-energy"

export {
  type CinematicMomentKind,
  type CinematicMomentState,
  resolveCinematicMoment,
} from "@/client/lib/reality/cinematic-moments"

export {
  type RealityMemoryEntry,
  enrichMemoryForReality,
  enrichMemoriesForReality,
} from "@/client/lib/reality/memory-cinema"

export { type RealityPresenceLine, buildRealityPresenceLine } from "@/client/lib/reality/reality-presence"

export { type EmotionalReality, analyzeEmotionalReality } from "@/client/lib/reality/analyze"
