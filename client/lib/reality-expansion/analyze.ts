import type { EmotionalOperatingSystem } from "@/client/lib/emotional-os/types"
import type { EmotionalRealityExpansion } from "@/client/lib/reality-expansion/types"
import { analyzeEmotionalLifeRhythm, rhythmAttrs, rhythmCss } from "@/client/lib/reality-expansion/life-rhythm"
import {
  deriveRelationshipWeather,
  weatherAttrs,
  weatherCss,
} from "@/client/lib/reality-expansion/relationship-weather"
import {
  resolveCinematicEmotionalState,
  cinematicAttrs,
  cinematicCss,
} from "@/client/lib/reality-expansion/cinematic-states"
import { deriveAdaptiveWorldAtmosphere, adaptiveCss } from "@/client/lib/reality-expansion/adaptive-atmosphere"
import {
  derivePresenceImmersion,
  presenceImmersionAttrs,
  presenceImmersionCss,
} from "@/client/lib/reality-expansion/presence-immersion"
import { buildRelationshipNarrative } from "@/client/lib/reality-expansion/relationship-narrative"
import { analyzeMemoryWorldField, memoryWorldCss } from "@/client/lib/reality-expansion/memory-world"
import { derivePlatformSoul, soulAttrs, soulCss } from "@/client/lib/reality-expansion/platform-soul"
import type { Locale } from "@/client/lib/i18n"
import type { GeoPosition } from "@/client/lib/geo"
import type { ChatMessage } from "@/client/lib/social-store"

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
