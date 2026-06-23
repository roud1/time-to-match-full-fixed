import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { TranslationKey } from "@/client/lib/i18n"

/** Local atmospheric insight when AI is loading or unavailable. */
export function pickLocalChatInsight(
  analysis: ConnectionAnalysis | null,
  view: ConnectionView | null,
  recentActivity: boolean,
  t: (key: TranslationKey) => string
): string | null {
  if (!analysis || !view) return null

  if (view.isFading || analysis.isDecaying) {
    return t("chatInsightEnergyCooling")
  }

  if (!view.bothParticipated) {
    return t("chatInsightWaitingMutual")
  }

  if (recentActivity && analysis.signals.nightMessageCount >= 2) {
    return t("chatInsightTonight")
  }

  if (recentActivity && analysis.chemistryLevel === "peak") {
    return t("chatInsightChemistryStronger")
  }

  if (analysis.bondLevel === "stable" || analysis.bondLevel === "deep") {
    return t("chatInsightBondStabilizing")
  }

  if (recentActivity && analysis.momentum >= 40) {
    return t("chatInsightConsistent")
  }

  if (recentActivity && analysis.syncPercent >= 50) {
    return t("chatInsightSyncGrowing")
  }

  if (analysis.chemistryPercent >= 55) {
    return t("chatInsightChemistryStronger")
  }

  return null
}
