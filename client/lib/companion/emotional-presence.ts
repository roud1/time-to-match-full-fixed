import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import type { TranslationKey } from "@/client/lib/i18n"

export type PresenceObservationKind =
  | "calmer"
  | "stronger_energy"
  | "stable_rhythm"
  | "sync_shift"
  | "deeper_tone"
  | "forming"

export type PresenceObservation = {
  kind: PresenceObservationKind
  textKey: TranslationKey
  priority: number
}

export function buildPresenceObservations(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis
): PresenceObservation[] {
  const items: PresenceObservation[] = []

  if (intelligence.deepState.state === "emotional_resonance") {
    items.push({ kind: "deeper_tone", textKey: "compPresenceDeeper", priority: 75 })
  }
  if (intelligence.rhythm.type === "calm_connection") {
    items.push({ kind: "calmer", textKey: "compPresenceCalmer", priority: 70 })
  }
  if (intelligence.rhythm.type === "intense_chemistry") {
    items.push({ kind: "stronger_energy", textKey: "compPresenceStronger", priority: 72 })
  }
  if (intelligence.forecast.tone === "steady") {
    items.push({ kind: "stable_rhythm", textKey: "compPresenceStable", priority: 65 })
  }
  if (analysis.momentum > 0.2) {
    items.push({ kind: "sync_shift", textKey: "compPresenceSyncShift", priority: 68 })
  }
  if (items.length === 0) {
    items.push({ kind: "forming", textKey: "compPresenceForming", priority: 40 })
  }

  return items.sort((a, b) => b.priority - a.priority)
}

export function pickPresenceObservation(
  intelligence: ConnectionIntelligence,
  analysis: ConnectionAnalysis
): PresenceObservation {
  return buildPresenceObservations(intelligence, analysis)[0]
}
