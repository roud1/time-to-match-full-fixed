"use client"

import { useMemo } from "react"
import type { ConnectionView } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { SyncMetrics } from "@/lib/sync-system"
import type { AIConnectionAnalysis } from "@/lib/ai-connection-engine/types"
import { getConnection } from "@/lib/connection-store"
import {
  analyzeRelationshipEcology,
  ecosystemStageDataAttrs,
  getStageProgress,
  type RelationshipEcology,
} from "@/lib/ecosystem"
import { auraCssVars } from "@/lib/relationship-identity"
import { useRelationshipIdentity } from "@/hooks/use-relationship-identity"

export function useRelationshipEcosystem(
  profileId: number | null,
  view: ConnectionView | null,
  messages: ChatMessage[],
  analysis: ConnectionAnalysis | null,
  metrics: SyncMetrics | null,
  ai: AIConnectionAnalysis | null
) {
  const identityBundle = useRelationshipIdentity(profileId, view, messages, analysis, metrics, ai)

  const ecology = useMemo((): RelationshipEcology | null => {
    if (profileId == null || !view || !analysis) return null
    const record = getConnection(profileId)
    if (!record) return null
    return analyzeRelationshipEcology(
      view,
      analysis,
      messages,
      record,
      identityBundle.identity?.evolutionStage ?? "forming"
    )
  }, [profileId, view, messages, analysis, identityBundle.identity?.evolutionStage])

  const stageProgress = useMemo(() => {
    if (!ecology || !identityBundle.identity) return 0
    return getStageProgress(ecology.stage, identityBundle.identity.evolutionProgress)
  }, [ecology, identityBundle.identity])

  const ecosystemStyle = useMemo(() => {
    if (!ecology || !identityBundle.aura) return identityBundle.auraStyle
    return {
      ...identityBundle.auraStyle,
      ...auraCssVars(identityBundle.aura),
      ["--eco-atmosphere-level" as string]: String(ecology.atmosphere.level),
      ["--eco-glow-mul" as string]: String(ecology.atmosphere.glowMul),
      ["--eco-particle-mul" as string]: String(ecology.atmosphere.particleMul),
      ["--eco-motion-scale" as string]: String(ecology.atmosphere.motionScale),
    } as React.CSSProperties
  }, [ecology, identityBundle.aura, identityBundle.auraStyle])

  const ecosystemAttrs = useMemo(() => {
    const base = identityBundle.auraAttrs
    if (!ecology) return base
    return {
      ...base,
      ...ecosystemStageDataAttrs(ecology.stage, ecology.atmosphere),
      "data-eco-trend": ecology.evolutionTrend,
      "data-eco-attach": ecology.attachmentPattern,
    }
  }, [ecology, identityBundle.auraAttrs])

  return {
    ...identityBundle,
    ecology,
    stageProgress,
    ecosystemStyle,
    ecosystemAttrs,
  }
}
