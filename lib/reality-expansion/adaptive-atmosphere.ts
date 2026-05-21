import type { EmotionalOrchestration } from "@/lib/emotional-os/orchestrator"
import type { AtmosphereNetworkState } from "@/lib/emotional-os/atmosphere-network"
import type { EmotionalLifeRhythm } from "@/lib/reality-expansion/life-rhythm"
import type { RelationshipWeather } from "@/lib/reality-expansion/relationship-weather"
import type { CinematicEmotionalState } from "@/lib/reality-expansion/cinematic-states"

export type AdaptiveWorldAtmosphere = {
  lightingShift: number
  motionScale: number
  glowIntensity: number
  gradientDepth: number
  pacingMs: number
}

export function deriveAdaptiveWorldAtmosphere(
  rhythm: EmotionalLifeRhythm,
  weather: RelationshipWeather,
  cinematic: CinematicEmotionalState,
  orchestration: EmotionalOrchestration,
  network: AtmosphereNetworkState
): AdaptiveWorldAtmosphere {
  return {
    lightingShift: Math.min(
      1,
      orchestration.atmosphereShift * 0.5 +
        weather.intensity * 0.25 +
        cinematic.glowDepth * 0.25
    ),
    motionScale:
      rhythm.energyCycle * cinematic.motionPace * weather.motionScale * orchestration.motionScale,
    glowIntensity: weather.glowMul * cinematic.glowDepth * network.syncAmbience,
    gradientDepth: 0.35 + cinematic.glowDepth * 0.4 + (network.cinematicNight ? 0.2 : 0),
    pacingMs: Math.round(orchestration.transitionMs * (cinematic.motionPace > 1 ? 0.85 : 1.1)),
  }
}

export function adaptiveCss(a: AdaptiveWorldAtmosphere): Record<string, string> {
  return {
    "--er-adaptive-light": String(a.lightingShift),
    "--er-adaptive-motion": String(a.motionScale),
    "--er-adaptive-glow": String(a.glowIntensity),
    "--er-adaptive-gradient": String(a.gradientDepth),
    "--er-adaptive-pacing": String(a.pacingMs),
  }
}
