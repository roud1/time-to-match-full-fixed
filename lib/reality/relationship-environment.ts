import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { TranslationKey } from "@/lib/i18n"

export type RelationshipEnvironmentId =
  | "calm_space"
  | "cinematic_intense"
  | "deep_night"
  | "soft_resonance"
  | "fading_distance"

export type RelationshipEnvironment = {
  id: RelationshipEnvironmentId
  labelKey: TranslationKey
  depth: number
  glow: number
  blurLayers: number
  particleDensity: number
  motionPace: number
  gradientHue: number
}

export function resolveRelationshipEnvironment(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis
): RelationshipEnvironment {
  const hour = new Date().getHours()
  const isNight = hour >= 21 || hour < 6
  const ui = intelligence.ui
  const { deepState, rhythm, forecast } = intelligence

  if (deepState.state === "emotional_distance" || forecast.tone === "softening") {
    return env("fading_distance", "realEnvFading", 0.25, 0.18, 0, 0.12, 0.75, 228)
  }

  if (isNight && (deepState.state === "emotional_resonance" || analysis.syncPercent >= 70)) {
    return env("deep_night", "realEnvNight", 0.72, 0.55, 2, 0.45, 0.88, 252)
  }

  if (rhythm.type === "intense_chemistry" || ui.mood === "intense") {
    return env("cinematic_intense", "realEnvIntense", 0.85, 0.78, 2, 0.72, 1.12, 292)
  }

  if (deepState.state === "emotional_resonance" || ui.mood === "resonant") {
    return env("soft_resonance", "realEnvResonance", 0.68, 0.62, 2, 0.52, 0.98, 278)
  }

  if (rhythm.type === "calm_connection" || deepState.state === "stable_emotional_rhythm") {
    return env("calm_space", "realEnvCalm", 0.42, 0.38, 1, 0.28, 0.88, 248)
  }

  return env("calm_space", "realEnvCalm", 0.5, 0.42, 1, 0.32, 0.92, 255)
}

function env(
  id: RelationshipEnvironmentId,
  labelKey: TranslationKey,
  depth: number,
  glow: number,
  blurLayers: number,
  particleDensity: number,
  motionPace: number,
  gradientHue: number
): RelationshipEnvironment {
  return { id, labelKey, depth, glow, blurLayers, particleDensity, motionPace, gradientHue }
}

export function environmentCss(env: RelationshipEnvironment): Record<string, string> {
  return {
    "--real-depth": String(env.depth),
    "--real-glow": String(env.glow),
    "--real-blur": String(env.blurLayers),
    "--real-particles": String(env.particleDensity),
    "--real-motion": String(env.motionPace),
    "--real-hue": String(env.gradientHue),
  }
}

export function environmentAttrs(env: RelationshipEnvironment): Record<string, string> {
  return {
    "data-real-env": env.id,
  }
}
