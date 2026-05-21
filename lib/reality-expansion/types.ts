import type { EmotionalLifeRhythm } from "@/lib/reality-expansion/life-rhythm"
import type { RelationshipWeather } from "@/lib/reality-expansion/relationship-weather"
import type { CinematicEmotionalState } from "@/lib/reality-expansion/cinematic-states"
import type { AdaptiveWorldAtmosphere } from "@/lib/reality-expansion/adaptive-atmosphere"
import type { PresenceImmersion } from "@/lib/reality-expansion/presence-immersion"
import type { RelationshipNarrative } from "@/lib/reality-expansion/relationship-narrative"
import type { MemoryWorldField } from "@/lib/reality-expansion/memory-world"
import type { PlatformSoul } from "@/lib/reality-expansion/platform-soul"

/** Phase 21 — Emotional Reality Expansion (platform as emotional life space). */
export type EmotionalRealityExpansion = {
  rhythm: EmotionalLifeRhythm
  weather: RelationshipWeather
  cinematic: CinematicEmotionalState
  atmosphere: AdaptiveWorldAtmosphere
  presence: PresenceImmersion
  narrative: RelationshipNarrative | null
  memory: MemoryWorldField
  soul: PlatformSoul
  style: Record<string, string>
  attrs: Record<string, string>
}
