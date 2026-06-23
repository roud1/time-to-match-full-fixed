import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { RelationshipRhythmType } from "@/client/lib/intelligence/relationship-rhythm"
import type { DeepConnectionState } from "@/client/lib/intelligence/connection-states"
import type { TranslationKey } from "@/client/lib/i18n"

export type MirrorLine = {
  id: string
  textKey: TranslationKey
}

export function buildPersonalityMirror(
  analysis: ConnectionAnalysis,
  rhythmType: RelationshipRhythmType,
  deepState: DeepConnectionState,
  prevSyncHint?: number
): MirrorLine[] {
  const lines: MirrorLine[] = []

  if (deepState === "emotional_resonance") {
    lines.push({ id: "resonance", textKey: "intelMirrorResonance" })
  } else if (deepState === "emotional_distance") {
    lines.push({ id: "distance", textKey: "intelMirrorDistance" })
  } else if (rhythmType === "calm_connection") {
    lines.push({ id: "calm", textKey: "intelMirrorCalmer" })
  } else if (rhythmType === "intense_chemistry") {
    lines.push({ id: "intense", textKey: "intelMirrorIntense" })
  }

  if (analysis.momentum > 0.15 && prevSyncHint != null && analysis.syncPercent > prevSyncHint) {
    lines.push({ id: "natural", textKey: "intelMirrorNatural" })
  } else if (analysis.bondPercent >= 55 && !analysis.isDecaying) {
    lines.push({ id: "stabilizing", textKey: "intelMirrorStabilizing" })
  }

  if (lines.length === 0) {
    lines.push({ id: "forming", textKey: "intelMirrorForming" })
  }

  return lines.slice(0, 2)
}
