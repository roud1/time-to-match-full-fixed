import type { RelationshipWeather } from "@/client/lib/reality-expansion/relationship-weather"
import type { EmotionalLifeRhythm } from "@/client/lib/reality-expansion/life-rhythm"
import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { TranslationKey } from "@/client/lib/i18n"

export type CinematicStateId =
  | "quiet_intimacy"
  | "emotional_gravity"
  | "slow_resonance"
  | "stable_orbit"
  | "deep_silence"

export type CinematicEmotionalState = {
  id: CinematicStateId
  motionPace: number
  glowDepth: number
  uiBreath: number
  blurDepth: number
  labelKey: TranslationKey
}

export function resolveCinematicEmotionalState(
  hub: ConnectionHubSnapshot,
  rhythm: EmotionalLifeRhythm,
  weather: RelationshipWeather
): CinematicEmotionalState {
  const sync = hub.platformSync

  if (rhythm.phase === "emotional_silence" || weather.kind === "fading_light") {
    return state("deep_silence", 0.68, 0.28, 0.4, 2.2, "erCineDeepSilence")
  }

  if (weather.kind === "quiet_night" || rhythm.phase === "night_intimacy") {
    return state("quiet_intimacy", 0.75, 0.55, 0.65, 2.8, "erCineQuietIntimacy")
  }

  if (weather.kind === "storm" || sync >= 80) {
    return state("emotional_gravity", 1.05, 0.72, 0.85, 1.4, "erCineGravity")
  }

  if (hub.evolutionMaturity === "deep" || hub.evolutionMaturity === "established") {
    return state("stable_orbit", 0.88, 0.62, 0.72, 1.8, "erCineStableOrbit")
  }

  return state("slow_resonance", 0.82, 0.48, 0.58, 2, "erCineSlowResonance")
}

function state(
  id: CinematicStateId,
  motionPace: number,
  glowDepth: number,
  uiBreath: number,
  blurDepth: number,
  labelKey: TranslationKey
): CinematicEmotionalState {
  return { id, motionPace, glowDepth, uiBreath, blurDepth, labelKey }
}

export function cinematicCss(c: CinematicEmotionalState): Record<string, string> {
  return {
    "--er-cine-motion": String(c.motionPace),
    "--er-cine-glow": String(c.glowDepth),
    "--er-cine-breath": String(c.uiBreath),
    "--er-cine-blur": String(c.blurDepth),
  }
}

export function cinematicAttrs(c: CinematicEmotionalState): Record<string, string> {
  return { "data-er-cinematic": c.id }
}
