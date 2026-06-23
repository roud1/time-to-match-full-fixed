/**
 * Phase 21 — Emotional Reality Expansion Layer.
 */
export type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion/types"

export {
  type EmotionalLifeRhythm,
  type LifeRhythmPhase,
  analyzeEmotionalLifeRhythm,
  rhythmCss,
  rhythmAttrs,
} from "@/client/lib/reality-expansion/life-rhythm"

export {
  type RelationshipWeather,
  type WeatherKind,
  deriveRelationshipWeather,
  weatherCss,
  weatherAttrs,
} from "@/client/lib/reality-expansion/relationship-weather"

export {
  type CinematicEmotionalState,
  type CinematicStateId,
  resolveCinematicEmotionalState,
  cinematicCss,
  cinematicAttrs,
} from "@/client/lib/reality-expansion/cinematic-states"

export {
  type AdaptiveWorldAtmosphere,
  deriveAdaptiveWorldAtmosphere,
  adaptiveCss,
} from "@/client/lib/reality-expansion/adaptive-atmosphere"

export {
  type PresenceImmersion,
  derivePresenceImmersion,
  presenceImmersionCss,
  presenceImmersionAttrs,
} from "@/client/lib/reality-expansion/presence-immersion"

export {
  type RelationshipNarrative,
  buildRelationshipNarrative,
  canShowRealityNarrative,
  markRealityNarrativeShown,
} from "@/client/lib/reality-expansion/relationship-narrative"

export {
  type MemoryWorldField,
  type MemoryFragment,
  analyzeMemoryWorldField,
  memoryWorldCss,
} from "@/client/lib/reality-expansion/memory-world"

export {
  type PlatformSoul,
  derivePlatformSoul,
  soulCss,
  soulAttrs,
} from "@/client/lib/reality-expansion/platform-soul"

export { analyzeEmotionalRealityExpansion } from "@/client/lib/reality-expansion/analyze"
