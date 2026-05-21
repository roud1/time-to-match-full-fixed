import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { RelationshipEcology } from "@/lib/ecosystem"
import type { TranslationKey } from "@/lib/i18n"
import { analyzeRelationshipPatterns } from "@/lib/shared/relationship-insights"

export type EmotionalPsychologyProfile = {
  rhythmScore: number
  attachmentEvolution: "deepening" | "steady" | "volatile" | "cooling"
  compatibilityTrend: "rising" | "stable" | "uncertain"
  interactionStyle: "balanced" | "expressive" | "reserved"
  insightTitleKey: TranslationKey
  insightBodyKey: TranslationKey
}

export function analyzeEmotionalPsychology(
  messages: ChatMessage[],
  record: ConnectionRecord,
  analysis: ConnectionAnalysis,
  ecology: RelationshipEcology | null
): EmotionalPsychologyProfile {
  const pattern = analyzeRelationshipPatterns(messages, record, analysis)
  const rhythmScore = ecology?.rhythmScore ?? Math.round(analysis.bondPercent * 0.7)

  let attachmentEvolution: EmotionalPsychologyProfile["attachmentEvolution"] = "steady"
  if (ecology?.evolutionTrend === "rising") attachmentEvolution = "deepening"
  else if (ecology?.evolutionTrend === "cooling") attachmentEvolution = "cooling"
  else if (ecology?.attachmentPattern === "anxious") attachmentEvolution = "volatile"

  let compatibilityTrend: EmotionalPsychologyProfile["compatibilityTrend"] = "stable"
  if (analysis.momentum > 0.2) compatibilityTrend = "rising"
  else if (analysis.isDecaying) compatibilityTrend = "uncertain"

  let interactionStyle: EmotionalPsychologyProfile["interactionStyle"] = "balanced"
  if (pattern.patternId === "one_sided") interactionStyle = "reserved"
  else if (pattern.patternId === "fast_replies") interactionStyle = "expressive"

  const keys = pickPsychologyKeys(attachmentEvolution, compatibilityTrend)

  return {
    rhythmScore,
    attachmentEvolution,
    compatibilityTrend,
    interactionStyle,
    insightTitleKey: keys.title,
    insightBodyKey: keys.body,
  }
}

function pickPsychologyKeys(
  attach: EmotionalPsychologyProfile["attachmentEvolution"],
  compat: EmotionalPsychologyProfile["compatibilityTrend"]
): { title: TranslationKey; body: TranslationKey } {
  if (attach === "deepening" && compat === "rising") {
    return { title: "netAiPsychDeepTitle", body: "netAiPsychDeepBody" }
  }
  if (attach === "cooling") {
    return { title: "netAiPsychCoolTitle", body: "netAiPsychCoolBody" }
  }
  if (attach === "volatile") {
    return { title: "netAiPsychVolatileTitle", body: "netAiPsychVolatileBody" }
  }
  return { title: "netAiPsychSteadyTitle", body: "netAiPsychSteadyBody" }
}
