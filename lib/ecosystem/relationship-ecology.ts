import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ConnectionEvolutionStage } from "@/lib/relationship-identity/types"
import type { TranslationKey } from "@/lib/i18n"
import {
  resolveEcosystemStage,
  getStageAtmosphere,
  type RelationshipEcosystemStage,
  type StageAtmosphere,
} from "@/lib/ecosystem/relationship-stages"
import { analyzeRelationshipPatterns, type RelationshipPatternId } from "@/lib/shared/relationship-insights"

export type AttachmentPattern = "secure" | "flowing" | "anxious" | "distant"

export type EvolutionTrend = "rising" | "steady" | "cooling"

export type RelationshipEcology = {
  stage: RelationshipEcosystemStage
  atmosphere: StageAtmosphere
  rhythmScore: number
  attachmentPattern: AttachmentPattern
  evolutionTrend: EvolutionTrend
  consistencyScore: number
  patternId: RelationshipPatternId
  insightTitleKey: TranslationKey
  insightBodyKey: TranslationKey
}

function attachmentFromSignals(
  analysis: ConnectionAnalysis,
  record: ConnectionRecord
): AttachmentPattern {
  const ratio = analysis.signals.oneSidedRatio
  if (ratio >= 0.68) return "anxious"
  if (ratio <= 0.32 && analysis.bondPercent >= 50) return "secure"
  if (analysis.emotionalState === "distant" || analysis.isDecaying) return "distant"
  if (analysis.momentum > 0.25) return "flowing"
  return "secure"
}

function trendFromView(view: ConnectionView, analysis: ConnectionAnalysis): EvolutionTrend {
  if (view.isFading || analysis.isDecaying) return "cooling"
  if (analysis.momentum > 0.2 || view.streakDays >= 2) return "rising"
  return "steady"
}

const ATTACHMENT_KEYS: Record<
  AttachmentPattern,
  { title: TranslationKey; body: TranslationKey }
> = {
  secure: { title: "ecoAttachSecureTitle", body: "ecoAttachSecureBody" },
  flowing: { title: "ecoAttachFlowTitle", body: "ecoAttachFlowBody" },
  anxious: { title: "ecoAttachAnxiousTitle", body: "ecoAttachAnxiousBody" },
  distant: { title: "ecoAttachDistantTitle", body: "ecoAttachDistantBody" },
}

export function analyzeRelationshipEcology(
  view: ConnectionView,
  analysis: ConnectionAnalysis,
  messages: ChatMessage[],
  record: ConnectionRecord,
  evolutionStage: ConnectionEvolutionStage
): RelationshipEcology {
  const stage = resolveEcosystemStage(view, analysis, evolutionStage)
  const atmosphere = getStageAtmosphere(stage)
  const pattern = analyzeRelationshipPatterns(messages, record, analysis)
  const attachmentPattern = attachmentFromSignals(analysis, record)
  const evolutionTrend = trendFromView(view, analysis)
  const rhythmScore = Math.min(
    100,
    Math.round(
      (analysis.signals.mutualSessions * 12 +
        analysis.signals.fastReplyCount * 4 +
        (1 - analysis.signals.oneSidedRatio) * 40 +
        view.streakDays * 6) *
        atmosphere.level
    )
  )
  const consistencyScore = Math.min(
    100,
    Math.round(analysis.signals.dailyStreak * 14 + analysis.bondPercent * 0.5)
  )
  const attach = ATTACHMENT_KEYS[attachmentPattern]

  return {
    stage,
    atmosphere,
    rhythmScore,
    attachmentPattern,
    evolutionTrend,
    consistencyScore,
    patternId: pattern.patternId,
    insightTitleKey: attach.title,
    insightBodyKey: attach.body,
  }
}
