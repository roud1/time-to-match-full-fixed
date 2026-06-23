import type { SyncMetrics } from "@/client/lib/sync-system"
import type { RelationshipLiveState } from "@/client/lib/shared/relationship-live-state"
import type { ConnectionAuraProfile } from "@/client/lib/relationship-identity"
import { getConnectionPersonalityLabel } from "@/client/lib/ai-connection-engine/personality"
import type { RelationshipEcosystemStage } from "@/client/lib/ecosystem"
import type { ShareMoment } from "@/client/lib/shared/share-moments"
import { STAGE_LABEL_KEYS } from "@/client/lib/ecosystem"
import type { TranslationKey } from "@/client/lib/i18n"

export function buildAuraShareMoment(
  partnerName: string,
  aura: ConnectionAuraProfile,
  stage: RelationshipEcosystemStage | undefined,
  syncPercent: number,
  state: RelationshipLiveState,
  t: (key: TranslationKey) => string
): ShareMoment {
  const personalityLabel = getConnectionPersonalityLabel(aura.personality, t)
  const stageLabel = stage ? t(STAGE_LABEL_KEYS[stage]) : ""
  return {
    kind: "aura",
    title: t("netShareAuraTitle"),
    subtitle: stageLabel ? `${stageLabel} · ${personalityLabel}` : personalityLabel,
    syncPercent,
    state,
    partnerName,
    hashtag: "TimeToMatch",
  }
}

export function buildMilestoneShareMoment(
  partnerName: string,
  milestoneTitle: string,
  milestoneBody: string,
  syncPercent: number,
  state: RelationshipLiveState
): ShareMoment {
  return {
    kind: "milestone",
    title: milestoneTitle,
    subtitle: milestoneBody,
    syncPercent,
    state,
    partnerName,
    hashtag: "TimeToMatch",
  }
}

export function buildEvolutionShareMoment(
  partnerName: string,
  eventTitle: string,
  eventBody: string,
  syncPercent: number,
  state: RelationshipLiveState
): ShareMoment {
  return {
    kind: "milestone",
    title: eventTitle,
    subtitle: eventBody,
    syncPercent,
    state,
    partnerName,
    hashtag: "TimeToMatch",
  }
}
