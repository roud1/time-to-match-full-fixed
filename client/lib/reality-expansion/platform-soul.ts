import type { EmotionalLifeRhythm } from "@/client/lib/reality-expansion/life-rhythm"
import type { RelationshipWeather } from "@/client/lib/reality-expansion/relationship-weather"
import type { CinematicEmotionalState } from "@/client/lib/reality-expansion/cinematic-states"
import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { TranslationKey } from "@/client/lib/i18n"

/** Atmospheric platform soul — presence without personality (Phase 21). */
export type PlatformSoul = {
  depth: number
  breathRate: number
  presenceKey: TranslationKey
  active: boolean
}

export function derivePlatformSoul(
  hub: ConnectionHubSnapshot,
  rhythm: EmotionalLifeRhythm,
  weather: RelationshipWeather,
  cinematic: CinematicEmotionalState
): PlatformSoul {
  const depth = Math.min(
    1,
    0.25 + cinematic.glowDepth * 0.35 + hub.attachmentDepth / 150 + rhythm.energyCycle * 0.2
  )

  let presenceKey: TranslationKey = "erSoulCalm"
  if (weather.kind === "quiet_night") presenceKey = "erSoulNight"
  else if (weather.kind === "warm_glow") presenceKey = "erSoulWarm"
  else if (rhythm.phase === "emotional_silence") presenceKey = "erSoulSilence"
  else if (hub.activeCount > 0) presenceKey = "erSoulLiving"

  return {
    depth,
    breathRate: 0.4 + cinematic.uiBreath * 0.35,
    presenceKey,
    active: true,
  }
}

export function soulCss(s: PlatformSoul): Record<string, string> {
  return {
    "--er-soul-depth": String(s.depth),
    "--er-soul-breath": String(s.breathRate),
  }
}

export function soulAttrs(s: PlatformSoul): Record<string, string> {
  return s.active ? { "data-er-soul": "true" } : {}
}
