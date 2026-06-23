import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { RelationshipEcology } from "@/client/lib/ecosystem"
import type { TranslationKey } from "@/client/lib/i18n"
import type { RelationshipRhythmType } from "@/client/lib/intelligence/relationship-rhythm"

/** Phase 14 — deep connection states (beyond ecosystem stages). */
export type DeepConnectionState =
  | "emotional_resonance"
  | "cognitive_alignment"
  | "attachment_formation"
  | "emotional_distance"
  | "stable_emotional_rhythm"

export type DeepConnectionStateProfile = {
  state: DeepConnectionState
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  depthLevel: number
}

const STATE_META: Record<
  DeepConnectionState,
  { labelKey: TranslationKey; descriptionKey: TranslationKey }
> = {
  emotional_resonance: {
    labelKey: "intelStateResonance",
    descriptionKey: "intelStateResonanceDesc",
  },
  cognitive_alignment: {
    labelKey: "intelStateCognitive",
    descriptionKey: "intelStateCognitiveDesc",
  },
  attachment_formation: {
    labelKey: "intelStateAttachment",
    descriptionKey: "intelStateAttachmentDesc",
  },
  emotional_distance: {
    labelKey: "intelStateDistance",
    descriptionKey: "intelStateDistanceDesc",
  },
  stable_emotional_rhythm: {
    labelKey: "intelStateStableRhythm",
    descriptionKey: "intelStateStableRhythmDesc",
  },
}

export function resolveDeepConnectionState(
  analysis: ConnectionAnalysis,
  ecology: RelationshipEcology | null,
  rhythmType: RelationshipRhythmType
): DeepConnectionStateProfile {
  let state: DeepConnectionState = "stable_emotional_rhythm"

  if (analysis.isDecaying || analysis.emotionalState === "fading" || rhythmType === "unstable") {
    state = "emotional_distance"
  } else if (
    ecology?.attachmentPattern === "secure" &&
    analysis.bondPercent >= 55 &&
    rhythmType === "calm_connection"
  ) {
    state = "attachment_formation"
  } else if (
    analysis.syncPercent >= 82 &&
    (ecology?.stage === "emotional_resonance" || ecology?.stage === "high_sync")
  ) {
    state = "emotional_resonance"
  } else if (
    analysis.signals.oneSidedRatio <= 0.42 &&
    analysis.bondPercent >= 50 &&
    rhythmType !== "emotional_imbalance"
  ) {
    state = "cognitive_alignment"
  } else if (rhythmType === "slow_burn" && analysis.bondLevel !== "forming") {
    state = "stable_emotional_rhythm"
  }

  const meta = STATE_META[state]
  const depthLevel = Math.min(
    1,
    analysis.syncPercent / 100 * 0.4 +
      analysis.bondPercent / 100 * 0.35 +
      (ecology?.atmosphere.level ?? 0.3) * 0.25
  )

  return { state, labelKey: meta.labelKey, descriptionKey: meta.descriptionKey, depthLevel }
}
