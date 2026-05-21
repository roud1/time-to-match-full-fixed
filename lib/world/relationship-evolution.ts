import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { TranslationKey } from "@/lib/i18n"
import { analyzeRelationshipEcology, type RelationshipEcology } from "@/lib/ecosystem"
import { getRelationshipIdentity } from "@/lib/relationship-identity"

export type EvolutionMaturity = "forming" | "developing" | "established" | "deep" | "renewing"

export type RelationshipEvolutionSnapshot = {
  ecology: RelationshipEcology
  maturity: EvolutionMaturity
  rhythmTrend: "accelerating" | "steady" | "softening"
  communicationDepth: number
  attachmentStability: number
  titleKey: TranslationKey
  bodyKey: TranslationKey
}

function maturityFromEcology(ecology: RelationshipEcology, sync: number): EvolutionMaturity {
  if (ecology.evolutionTrend === "cooling") return "renewing"
  if (ecology.stage === "high_sync" || ecology.stage === "emotional_resonance") return "deep"
  if (ecology.stage === "stable_bond" || ecology.stage === "deep_chemistry") return "established"
  if (ecology.stage === "growing_energy") return "developing"
  return sync >= 40 ? "developing" : "forming"
}

function rhythmTrend(ecology: RelationshipEcology): RelationshipEvolutionSnapshot["rhythmTrend"] {
  if (ecology.evolutionTrend === "rising") return "accelerating"
  if (ecology.evolutionTrend === "cooling") return "softening"
  return "steady"
}

const MATURITY_KEYS: Record<
  EvolutionMaturity,
  { title: TranslationKey; body: TranslationKey }
> = {
  forming: { title: "evoFormingTitle", body: "evoFormingBody" },
  developing: { title: "evoDevelopingTitle", body: "evoDevelopingBody" },
  established: { title: "evoEstablishedTitle", body: "evoEstablishedBody" },
  deep: { title: "evoDeepTitle", body: "evoDeepBody" },
  renewing: { title: "evoRenewingTitle", body: "evoRenewingBody" },
}

export function analyzeRelationshipEvolution(
  view: ConnectionView,
  analysis: ConnectionAnalysis,
  messages: ChatMessage[],
  record: ConnectionRecord
): RelationshipEvolutionSnapshot {
  const identity = getRelationshipIdentity(view.profileId)
  const ecology = analyzeRelationshipEcology(
    view,
    analysis,
    messages,
    record,
    identity?.evolutionStage ?? "forming"
  )
  const maturity = maturityFromEcology(ecology, analysis.syncPercent)
  const keys = MATURITY_KEYS[maturity]
  const communicationDepth = Math.min(
    100,
    Math.round(ecology.rhythmScore * 0.5 + analysis.bondPercent * 0.35 + analysis.signals.mutualSessions * 8)
  )
  const attachmentStability = Math.min(
    100,
    Math.round(
      ecology.consistencyScore * 0.6 +
        (ecology.attachmentPattern === "secure" || ecology.attachmentPattern === "flowing" ? 28 : 10)
    )
  )

  return {
    ecology,
    maturity,
    rhythmTrend: rhythmTrend(ecology),
    communicationDepth,
    attachmentStability,
    titleKey: keys.title,
    bodyKey: keys.body,
  }
}
