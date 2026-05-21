import type { DeepConnectionState } from "@/lib/intelligence/connection-states"
import type { RelationshipRhythmType } from "@/lib/intelligence/relationship-rhythm"
import type { CompatibilityIntelligence } from "@/lib/intelligence/compatibility-engine"
import type { ConnectionForecastTone } from "@/lib/intelligence/connection-forecast"

export type EmotionalUiMood = "calm" | "warm" | "intense" | "fading" | "resonant"

export type EmotionalUiTokens = {
  mood: EmotionalUiMood
  motionScale: number
  glowIntensity: number
  gradientHue: number
  blurDepth: number
  particleDensity: number
}

export function deriveEmotionalUiTokens(
  compatibility: CompatibilityIntelligence,
  rhythmType: RelationshipRhythmType,
  deepState: DeepConnectionState,
  forecastTone: ConnectionForecastTone
): EmotionalUiTokens {
  let mood: EmotionalUiMood = "warm"
  let motionScale = 1
  let glowIntensity = 0.45
  let gradientHue = 265
  let blurDepth = 1
  let particleDensity = 0.4

  if (deepState === "emotional_distance" || forecastTone === "softening") {
    mood = "fading"
    motionScale = 0.82
    glowIntensity = 0.22
    gradientHue = 230
    blurDepth = 0
    particleDensity = 0.15
  } else if (deepState === "emotional_resonance") {
    mood = "resonant"
    motionScale = 1.06
    glowIntensity = Math.min(0.95, 0.5 + compatibility.emotionalResonance / 200)
    gradientHue = 280
    blurDepth = 2
    particleDensity = 0.65
  } else if (rhythmType === "intense_chemistry") {
    mood = "intense"
    motionScale = 1.1
    glowIntensity = 0.75
    gradientHue = 290
    blurDepth = 2
    particleDensity = 0.7
  } else if (rhythmType === "calm_connection" || deepState === "stable_emotional_rhythm") {
    mood = "calm"
    motionScale = 0.92
    glowIntensity = 0.38
    gradientHue = 250
    blurDepth = 1
    particleDensity = 0.28
  }

  if (deepState === "emotional_resonance") {
    mood = "resonant"
  }

  return {
    mood,
    motionScale,
    glowIntensity,
    gradientHue,
    blurDepth,
    particleDensity,
  }
}

export function uiIntelligenceStyle(tokens: EmotionalUiTokens): Record<string, string> {
  return {
    "--intel-mood": tokens.mood,
    "--intel-motion-scale": String(tokens.motionScale),
    "--intel-glow": String(tokens.glowIntensity),
    "--intel-hue": String(tokens.gradientHue),
    "--intel-blur-depth": String(tokens.blurDepth),
    "--intel-particle-density": String(tokens.particleDensity),
  }
}

export function uiIntelligenceAttrs(
  tokens: EmotionalUiTokens,
  deepState?: string
): Record<string, string> {
  const attrs: Record<string, string> = { "data-intel-mood": tokens.mood }
  if (deepState) attrs["data-intel-deep-state"] = deepState
  return attrs
}
