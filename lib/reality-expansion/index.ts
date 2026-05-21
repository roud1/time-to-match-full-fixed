/**
 * Phase 21 — Emotional Reality Expansion Layer.
 */
export type { EmotionalRealityExpansion } from "@/lib/reality-expansion/types"

export {
  type EmotionalLifeRhythm,
  type LifeRhythmPhase,
  analyzeEmotionalLifeRhythm,
  rhythmCss,
  rhythmAttrs,
} from "@/lib/reality-expansion/life-rhythm"

export {
  type RelationshipWeather,
  type WeatherKind,
  deriveRelationshipWeather,
  weatherCss,
  weatherAttrs,
} from "@/lib/reality-expansion/relationship-weather"

export {
  type CinematicEmotionalState,
  type CinematicStateId,
  resolveCinematicEmotionalState,
  cinematicCss,
  cinematicAttrs,
} from "@/lib/reality-expansion/cinematic-states"

export {
  type AdaptiveWorldAtmosphere,
  deriveAdaptiveWorldAtmosphere,
  adaptiveCss,
} from "@/lib/reality-expansion/adaptive-atmosphere"

export {
  type PresenceImmersion,
  derivePresenceImmersion,
  presenceImmersionCss,
  presenceImmersionAttrs,
} from "@/lib/reality-expansion/presence-immersion"

export {
  type RelationshipNarrative,
  buildRelationshipNarrative,
  canShowRealityNarrative,
  markRealityNarrativeShown,
} from "@/lib/reality-expansion/relationship-narrative"

export {
  type MemoryWorldField,
  type MemoryFragment,
  analyzeMemoryWorldField,
  memoryWorldCss,
} from "@/lib/reality-expansion/memory-world"

export {
  type PlatformSoul,
  derivePlatformSoul,
  soulCss,
  soulAttrs,
} from "@/lib/reality-expansion/platform-soul"

export { analyzeEmotionalRealityExpansion } from "@/lib/reality-expansion/analyze"
