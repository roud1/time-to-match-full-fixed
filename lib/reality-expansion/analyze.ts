import type { EmotionalOperatingSystem } from "@/lib/emotional-os/types"
import type { EmotionalRealityExpansion } from "@/lib/reality-expansion/types"
import { analyzeEmotionalLifeRhythm, rhythmAttrs, rhythmCss } from "@/lib/reality-expansion/life-rhythm"
import {
  deriveRelationshipWeather,
  weatherAttrs,
  weatherCss,
} from "@/lib/reality-expansion/relationship-weather"
import {
  resolveCinematicEmotionalState,
  cinematicAttrs,
  cinematicCss,
} from "@/lib/reality-expansion/cinematic-states"
import { deriveAdaptiveWorldAtmosphere, adaptiveCss } from "@/lib/reality-expansion/adaptive-atmosphere"
import {
  derivePresenceImmersion,
  presenceImmersionAttrs,
  presenceImmersionCss,
} from "@/lib/reality-expansion/presence-immersion"
import { buildRelationshipNarrative } from "@/lib/reality-expansion/relationship-narrative"
import { analyzeMemoryWorldField, memoryWorldCss } from "@/lib/reality-expansion/memory-world"
import { derivePlatformSoul, soulAttrs, soulCss } from "@/lib/reality-expansion/platform-soul"
import type { Locale } from "@/lib/i18n"
import type { GeoPosition } from "@/lib/geo"
import type { ChatMessage } from "@/lib/social-store"

export function analyzeEmotionalRealityExpansion(
  os: EmotionalOperatingSystem,
  options?: {
    hour?: number
    locale?: Locale
    position?: GeoPosition | null
    profileId?: number
    messages?: ChatMessage[]
  }
): EmotionalRealityExpansion {
  const hour = options?.hour ?? new Date().getHours()
  const rhythm = analyzeEmotionalLifeRhythm({
    locale: options?.locale,
    position: options?.position,
    hour,
  })
  const weather = deriveRelationshipWeather(os.hub, rhythm, hour)
  const cinematic = resolveCinematicEmotionalState(os.hub, rhythm, weather)
  const atmosphere = deriveAdaptiveWorldAtmosphere(
    rhythm,
    weather,
    cinematic,
    os.orchestration,
    os.network
  )
  const profileProximity = os.reality?.resonanceLevel
  const presence = derivePresenceImmersion(os.hub, rhythm, weather, profileProximity)
  const narrative = buildRelationshipNarrative(os.hub, rhythm, weather, {
    profileId: options?.profileId,
  })
  const memory = analyzeMemoryWorldField()
  const soul = derivePlatformSoul(os.hub, rhythm, weather, cinematic)

  const style: Record<string, string> = {
    ...rhythmCss(rhythm),
    ...weatherCss(weather),
    ...cinematicCss(cinematic),
    ...adaptiveCss(atmosphere),
    ...presenceImmersionCss(presence),
    ...memoryWorldCss(memory),
    ...soulCss(soul),
  }

  const attrs: Record<string, string> = {
    ...rhythmAttrs(rhythm),
    ...weatherAttrs(weather),
    ...cinematicAttrs(cinematic),
    ...presenceImmersionAttrs(presence),
    ...soulAttrs(soul),
    "data-emotional-reality": "true",
    "data-er-expansion": "true",
  }

  return {
    rhythm,
    weather,
    cinematic,
    atmosphere,
    presence,
    narrative,
    memory,
    soul,
    style,
    attrs,
  }
}
