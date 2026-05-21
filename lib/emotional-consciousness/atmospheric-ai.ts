import type { EmotionalOperatingSystem } from "@/lib/emotional-os/types"
import type { EmotionalRealityExpansion } from "@/lib/reality-expansion/types"
import type { SilenceUnderstanding } from "@/lib/emotional-consciousness/silence-understanding"
import type { RelationshipTension } from "@/lib/emotional-consciousness/relationship-tension"
import type { ConsciousnessReading } from "@/lib/emotional-consciousness/consciousness-engine"

export type AtmosphericConsciousness = {
  visualSilence: number
  emotionalPacing: number
  cinematicStillness: number
  ambientMovement: number
  atmosphereWeight: number
}

export function orchestrateAtmosphericConsciousness(
  os: EmotionalOperatingSystem,
  expansion: EmotionalRealityExpansion,
  reading: ConsciousnessReading,
  silence: SilenceUnderstanding,
  tension: RelationshipTension
): AtmosphericConsciousness {
  const stillness =
    silence.stillness * 0.5 +
    (1 - expansion.cinematic.motionPace) * 0.3 +
    (1 - tension.motionTension) * 0.2

  const visualSilence = Math.min(1, silence.depth * 0.55 + stillness * 0.45)
  const emotionalPacing =
    reading.pacing === "slow" ? 0.35 : reading.pacing === "urgent" ? 0.85 : 0.55
  const cinematicStillness = Math.min(1, stillness + expansion.cinematic.glowDepth * 0.15)
  const ambientMovement = Math.min(
    1.2,
    tension.motionTension * 0.4 +
      expansion.atmosphere.motionScale * 0.35 +
      os.continuity.breathRate * 0.25
  )
  const atmosphereWeight = Math.min(
    1,
    expansion.atmosphere.gradientDepth * 0.4 + visualSilence * 0.35 + reading.depthSense * 0.25
  )

  return {
    visualSilence,
    emotionalPacing,
    cinematicStillness,
    ambientMovement,
    atmosphereWeight,
  }
}

export function atmosphericCss(a: AtmosphericConsciousness): Record<string, string> {
  return {
    "--ec-visual-silence": String(a.visualSilence),
    "--ec-emotional-pacing": String(a.emotionalPacing),
    "--ec-cinematic-still": String(a.cinematicStillness),
    "--ec-ambient-move": String(a.ambientMovement),
    "--ec-atmosphere-weight": String(a.atmosphereWeight),
  }
}
