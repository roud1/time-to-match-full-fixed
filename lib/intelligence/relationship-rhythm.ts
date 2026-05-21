import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { TranslationKey } from "@/lib/i18n"
import type { RelationshipPatternId } from "@/lib/shared/relationship-insights"

export type RelationshipRhythmType =
  | "slow_burn"
  | "intense_chemistry"
  | "unstable"
  | "calm_connection"
  | "emotional_imbalance"

export type RelationshipRhythm = {
  type: RelationshipRhythmType
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  stability: number
}

const RHYTHM_META: Record<
  RelationshipRhythmType,
  { labelKey: TranslationKey; descriptionKey: TranslationKey }
> = {
  slow_burn: { labelKey: "intelRhythmSlowBurn", descriptionKey: "intelRhythmSlowBurnDesc" },
  intense_chemistry: {
    labelKey: "intelRhythmIntense",
    descriptionKey: "intelRhythmIntenseDesc",
  },
  unstable: { labelKey: "intelRhythmUnstable", descriptionKey: "intelRhythmUnstableDesc" },
  calm_connection: { labelKey: "intelRhythmCalm", descriptionKey: "intelRhythmCalmDesc" },
  emotional_imbalance: {
    labelKey: "intelRhythmImbalance",
    descriptionKey: "intelRhythmImbalanceDesc",
  },
}

export function resolveRelationshipRhythm(
  analysis: ConnectionAnalysis,
  record: ConnectionRecord,
  patternId: RelationshipPatternId
): RelationshipRhythm {
  let type: RelationshipRhythmType = "calm_connection"

  if (patternId === "one_sided" || analysis.signals.oneSidedRatio >= 0.68) {
    type = "emotional_imbalance"
  } else if (analysis.chemistryLevel === "peak" || analysis.chemistryPercent >= 78) {
    type = "intense_chemistry"
  } else if (patternId === "slow_burn" || (record.streakDays >= 3 && analysis.momentum < 0.2)) {
    type = "slow_burn"
  } else if (analysis.emotionalState === "distant" || analysis.isDecaying) {
    type = "unstable"
  } else if (analysis.emotionalState === "warm" || analysis.emotionalState === "aligned") {
    type = "calm_connection"
  }

  const meta = RHYTHM_META[type]
  const stability = Math.min(
    100,
    Math.round(
      (1 - Math.abs(analysis.signals.oneSidedRatio - 0.5)) * 50 +
        analysis.bondPercent * 0.35 +
        (analysis.isDecaying ? 0 : 15)
    )
  )

  return { type, labelKey: meta.labelKey, descriptionKey: meta.descriptionKey, stability }
}
