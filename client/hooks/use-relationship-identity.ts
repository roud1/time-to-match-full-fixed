"use client"

import { useEffect, useMemo } from "react"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { AIConnectionAnalysis } from "@/client/lib/ai-connection-engine/types"
import { getConnection } from "@/client/lib/connection-store"
import { extractAIConnectionSignals } from "@/client/lib/ai-connection-engine"
import {
  buildConnectionAura,
  auraCssVars,
  auraDataAttributes,
  buildRelationshipMoments,
  resolveRelationshipPersonality,
  resolveEvolutionStage,
  evolutionProgress,
  evolvePersonality,
  getRelationshipIdentity,
  persistRelationshipIdentity,
  type ConnectionAuraProfile,
  type RelationshipIdentity,
  type RelationshipMoment,
} from "@/client/lib/relationship-identity"
import { useI18n } from "@/client/lib/i18n"

export function useRelationshipIdentity(
  profileId: number | null,
  view: ConnectionView | null,
  messages: ChatMessage[],
  analysis: ConnectionAnalysis | null,
  metrics: SyncMetrics | null,
  ai: AIConnectionAnalysis | null
): {
  identity: RelationshipIdentity | null
  aura: ConnectionAuraProfile | null
  moments: RelationshipMoment[]
  auraStyle: React.CSSProperties
  auraAttrs: Record<string, string>
} {
  const { t } = useI18n()

  const bundle = useMemo(() => {
    if (profileId == null || !view) {
      return {
        identity: null as RelationshipIdentity | null,
        aura: null as ConnectionAuraProfile | null,
        moments: [] as RelationshipMoment[],
      }
    }

    const record = getConnection(profileId)
    if (!record || !analysis) {
      return { identity: null, aura: null, moments: [] }
    }

    const signals = extractAIConnectionSignals(messages, record)

    const resolved = resolveRelationshipPersonality(ai, analysis, signals, view)
    const prev = getRelationshipIdentity(profileId)
    const personality = prev
      ? evolvePersonality(prev.personality, analysis, signals, view)
      : resolved

    const syncPercent = metrics?.syncPercent ?? analysis.syncPercent
    const isFading = view.isFading || analysis.isDecaying
    const evolutionStage = resolveEvolutionStage(
      syncPercent,
      isFading,
      view.bothParticipated
    )
    const evProgress = evolutionProgress(evolutionStage, syncPercent)

    const moments = buildRelationshipMoments(messages, record, signals, syncPercent, t)

    const aura = buildConnectionAura(
      personality,
      evolutionStage,
      syncPercent,
      metrics?.atmosphereGlow
    )

    const identity: RelationshipIdentity = {
      profileId,
      personality,
      evolutionStage,
      evolutionProgress: evProgress,
      syncPercent,
      moments,
      updatedAt: Date.now(),
    }

    return { identity, aura, moments }
  }, [profileId, view, messages, analysis, metrics, ai, t])

  useEffect(() => {
    if (bundle.identity) persistRelationshipIdentity(bundle.identity)
  }, [bundle.identity])

  const auraStyle = bundle.aura
    ? (auraCssVars(bundle.aura) as React.CSSProperties)
    : {}
  const auraAttrs = bundle.aura ? auraDataAttributes(bundle.aura) : {}

  return {
    identity: bundle.identity,
    aura: bundle.aura,
    moments: bundle.moments,
    auraStyle,
    auraAttrs,
  }
}
