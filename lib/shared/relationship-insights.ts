import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { TranslationKey } from "@/lib/i18n"

export type RelationshipPatternId =
  | "night_owl"
  | "fast_replies"
  | "slow_burn"
  | "balanced"
  | "one_sided"

export type RelationshipInsight = {
  patternId: RelationshipPatternId
  titleKey: TranslationKey
  bodyKey: TranslationKey
  rhythmKey: TranslationKey
  compatibilityNoteKey: TranslationKey
}

export function analyzeRelationshipPatterns(
  messages: ChatMessage[],
  record: ConnectionRecord,
  analysis: ConnectionAnalysis | null
): RelationshipInsight {
  const sorted = [...messages].sort((a, b) => a.at - b.at)
  const night = sorted.filter((m) => {
    const h = new Date(m.at).getHours()
    return h >= 22 || h < 5
  }).length
  const nightRatio = sorted.length ? night / sorted.length : 0
  const fast = analysis?.signals.fastReplyCount ?? 0
  const oneSided = analysis?.signals.oneSidedRatio ?? 0.5

  let patternId: RelationshipPatternId = "balanced"
  if (nightRatio >= 0.35) patternId = "night_owl"
  else if (fast >= 4) patternId = "fast_replies"
  else if (record.streakDays >= 4 && (analysis?.momentum ?? 0) < 0.25) patternId = "slow_burn"
  else if (oneSided >= 0.65) patternId = "one_sided"

  const map: Record<
    RelationshipPatternId,
    { titleKey: TranslationKey; bodyKey: TranslationKey; rhythmKey: TranslationKey; compatibilityNoteKey: TranslationKey }
  > = {
    night_owl: {
      titleKey: "insightPatternNightTitle",
      bodyKey: "insightPatternNightBody",
      rhythmKey: "insightRhythmNight",
      compatibilityNoteKey: "insightCompatNight",
    },
    fast_replies: {
      titleKey: "insightPatternFastTitle",
      bodyKey: "insightPatternFastBody",
      rhythmKey: "insightRhythmFast",
      compatibilityNoteKey: "insightCompatFast",
    },
    slow_burn: {
      titleKey: "insightPatternSlowTitle",
      bodyKey: "insightPatternSlowBody",
      rhythmKey: "insightRhythmSlow",
      compatibilityNoteKey: "insightCompatSlow",
    },
    balanced: {
      titleKey: "insightPatternBalancedTitle",
      bodyKey: "insightPatternBalancedBody",
      rhythmKey: "insightRhythmBalanced",
      compatibilityNoteKey: "insightCompatBalanced",
    },
    one_sided: {
      titleKey: "insightPatternOneSidedTitle",
      bodyKey: "insightPatternOneSidedBody",
      rhythmKey: "insightRhythmOneSided",
      compatibilityNoteKey: "insightCompatOneSided",
    },
  }

  const row = map[patternId]
  return { patternId, ...row }
}
