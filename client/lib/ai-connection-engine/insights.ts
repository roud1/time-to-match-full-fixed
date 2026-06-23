import type { AIConnectionAnalysis, AIConnectionSignals } from "@/client/lib/ai-connection-engine/types"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { TranslationKey } from "@/client/lib/i18n"

/** Premium local insights when model is unavailable. */
export function pickAIInsight(
  ai: AIConnectionAnalysis | null,
  local: ConnectionAnalysis | null,
  signals: AIConnectionSignals | null,
  recentActivity: boolean,
  t: (key: TranslationKey) => string
): string | null {
  if (ai?.insight?.trim()) return ai.insight.trim()

  if (!local) return null

  if (local.isDecaying) return t("aiInsightEnergyCooling")
  if (!recentActivity && signals && signals.avgReplyMs != null && signals.avgReplyMs > 6 * 60 * 60 * 1000) {
    return t("aiInsightEnergyCooling")
  }

  if (recentActivity && signals && signals.fastReplyCount >= 2) {
    return t("aiInsightFasterReplies")
  }

  if (recentActivity && signals && signals.lateNightRatio >= 0.25) {
    return t("aiInsightTonight")
  }

  if (local.bondLevel === "stable" || local.bondLevel === "deep") {
    return t("aiInsightMoreStable")
  }

  if (local.chemistryLevel === "peak" || local.chemistryPercent >= 70) {
    return t("aiInsightChemistryUp")
  }

  if (recentActivity && local.momentum >= 35) {
    return t("aiInsightConsistent")
  }

  if (recentActivity && local.syncPercent >= 45) {
    return t("aiInsightEnergyGrowing")
  }

  return t("aiInsightRhythm")
}
