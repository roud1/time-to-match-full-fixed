import type { EmotionalLifeRhythm } from "@/client/lib/reality-expansion/life-rhythm"
import type { RelationshipWeather } from "@/client/lib/reality-expansion/relationship-weather"
import type { CinematicEmotionalState } from "@/client/lib/reality-expansion/cinematic-states"
import type { AdaptiveWorldAtmosphere } from "@/client/lib/reality-expansion/adaptive-atmosphere"
import type { PresenceImmersion } from "@/client/lib/reality-expansion/presence-immersion"
import type { RelationshipNarrative } from "@/client/lib/reality-expansion/relationship-narrative"
import type { MemoryWorldField } from "@/client/lib/reality-expansion/memory-world"
import type { PlatformSoul } from "@/client/lib/reality-expansion/platform-soul"

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
