import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import type { DeepConnectionState } from "@/client/lib/intelligence/connection-states"
import type { RelationshipRhythmType } from "@/client/lib/intelligence/relationship-rhythm"

export type CompanionAtmosphere = {
  breathingIntensity: number
  pulseSpeed: number
  blurStrength: number
  gradientWarmth: number
  motionScale: number
}

export function deriveCompanionAtmosphere(
  intelligence: ConnectionIntelligence
): CompanionAtmosphere {
  const ui = intelligence.ui
  let breathingIntensity = 0.35 + intelligence.compatibility.emotionalResonance / 200
  let pulseSpeed = 1
  let blurStrength = ui.blurDepth
  let gradientWarmth = ui.glowIntensity

  if (intelligence.deepState.state === "emotional_distance") {
    breathingIntensity = 0.2
    pulseSpeed = 0.75
    blurStrength = 0
    gradientWarmth = 0.2
  } else if (intelligence.rhythm.type === "intense_chemistry") {
    breathingIntensity = 0.55
    pulseSpeed = 1.15
    blurStrength = 2
    gradientWarmth = 0.8
  } else if (intelligence.deepState.state === "stable_emotional_rhythm") {
    breathingIntensity = 0.38
    pulseSpeed = 0.9
    gradientWarmth = 0.45
  }

  return {
    breathingIntensity: Math.min(0.7, breathingIntensity),
    pulseSpeed,
    blurStrength,
    gradientWarmth,
    motionScale: ui.motionScale,
  }
}

export function companionAtmosphereAttrs(
  atmosphere: CompanionAtmosphere,
  deepState: DeepConnectionState,
  rhythm: RelationshipRhythmType
): Record<string, string> {
  return {
    "data-comp-deep": deepState,
    "data-comp-rhythm": rhythm,
    "data-comp-breathe": String(Math.round(atmosphere.breathingIntensity * 100)),
  }
}

export function companionAtmosphereCss(atmosphere: CompanionAtmosphere): Record<string, string> {
  return {
    ["--comp-breathe" as string]: String(atmosphere.breathingIntensity),
    ["--comp-pulse-speed" as string]: String(atmosphere.pulseSpeed),
    ["--comp-blur" as string]: String(atmosphere.blurStrength),
    ["--comp-warmth" as string]: String(atmosphere.gradientWarmth),
    ["--comp-motion" as string]: String(atmosphere.motionScale),
  }
}
