import type { ConnectionHubSnapshot } from "@/client/lib/emotional-os/connection-hub"
import type { SilenceUnderstanding } from "@/client/lib/emotional-consciousness/silence-understanding"
import type { ConsciousnessReading } from "@/client/lib/emotional-consciousness/consciousness-engine"
import type { TranslationKey } from "@/client/lib/i18n"

export type TensionKind =
  | "unstable_chemistry"
  | "emotional_drift"
  | "strong_attraction"
  | "calm_resonance"
  | "deep_orbit"

export type RelationshipTension = {
  kind: TensionKind
  level: number
  motionTension: number
  glowTension: number
  gradientPull: number
  labelKey: TranslationKey
}

export function deriveRelationshipTension(
  hub: ConnectionHubSnapshot,
  reading: ConsciousnessReading,
  silence: SilenceUnderstanding
): RelationshipTension {
  const sync = hub.platformSync
  const chem = hub.chemistryIndex

  if (silence.kind === "fading_silence" || hub.hasFading) {
    return tension("emotional_drift", 0.62, 0.82, 0.35, 0.4, "ecTensionDrift")
  }

  if (hub.dominantEmotionalState === "electric" || chem >= 70) {
    return tension("strong_attraction", 0.78, 1.08, 0.85, 0.7, "ecTensionAttraction")
  }

  if (hub.dominantEmotionalState === "aligned" && sync >= 65) {
    return tension("deep_orbit", 0.72, 0.95, 0.75, 0.65, "ecTensionDeepOrbit")
  }

  if (reading.consistency < 0.45 || chem < 40) {
    return tension("unstable_chemistry", 0.55, 1.05, 0.5, 0.45, "ecTensionUnstable")
  }

  return tension("calm_resonance", 0.38, 0.88, 0.55, 0.5, "ecTensionCalm")
}

function tension(
  kind: TensionKind,
  level: number,
  motionTension: number,
  glowTension: number,
  gradientPull: number,
  labelKey: TranslationKey
): RelationshipTension {
  return { kind, level, motionTension, glowTension, gradientPull, labelKey }
}

export function tensionCss(t: RelationshipTension): Record<string, string> {
  return {
    "--ec-tension-level": String(t.level),
    "--ec-tension-motion": String(t.motionTension),
    "--ec-tension-glow": String(t.glowTension),
    "--ec-tension-gradient": String(t.gradientPull),
  }
}

export function tensionAttrs(t: RelationshipTension): Record<string, string> {
  return { "data-ec-tension": t.kind }
}
