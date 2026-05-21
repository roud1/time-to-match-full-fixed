/**
 * Phase 16 — Emotional Reality Layer (living digital relationship space).
 */
export {
  type RelationshipEnvironmentId,
  type RelationshipEnvironment,
  resolveRelationshipEnvironment,
  environmentCss,
  environmentAttrs,
} from "@/lib/reality/relationship-environment"

export {
  type AtmosphereEvolutionPhase,
  type AtmosphereEvolution,
  deriveAtmosphereEvolution,
  evolutionCss,
  evolutionAttrs,
} from "@/lib/reality/atmosphere-evolution"

export {
  type ConnectionEnergyProfile,
  buildConnectionEnergy,
  energyCss,
} from "@/lib/reality/connection-energy"

export {
  type CinematicMomentKind,
  type CinematicMomentState,
  resolveCinematicMoment,
} from "@/lib/reality/cinematic-moments"

export {
  type RealityMemoryEntry,
  enrichMemoryForReality,
  enrichMemoriesForReality,
} from "@/lib/reality/memory-cinema"

export { type RealityPresenceLine, buildRealityPresenceLine } from "@/lib/reality/reality-presence"

export { type EmotionalReality, analyzeEmotionalReality } from "@/lib/reality/analyze"
