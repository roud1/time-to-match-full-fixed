"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ConnectionView } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import { getConnection } from "@/lib/connection-store"
import { analyzeConnection, type ConnectionAnalysis } from "@/lib/connection-engine"
import { buildConnectionMilestones, type TimelineMilestone } from "@/lib/connection-timeline"
import { deriveSyncMetrics, type SyncMetrics } from "@/lib/sync-system"
import {
  buildAnalyzeConnectionRequest,
  fetchConnectionAIAnalysis,
} from "@/lib/connection-ai-client"
import { mergeAnalysisWithAI } from "@/lib/connection-ai-merge"
import type { AIConnectionAnalysis, AIAtmosphereProfile } from "@/lib/ai-connection-engine/types"
import {
  detectAIMemories,
  mergeAIMemories,
  pickAIInsight,
  resolveAIConnectionState,
  extractAIConnectionSignals,
} from "@/lib/ai-connection-engine"
import {
  buildConnectionAura,
  resolveRelationshipPersonality,
  resolveEvolutionStage,
  normalizePersonality,
} from "@/lib/relationship-identity"
import { mergeAndPersistAIMemories } from "@/lib/ai-connection-memory-store"
import { useI18n } from "@/lib/i18n"

export function useConnectionAnalysis(
  view: ConnectionView | null,
  messages: ChatMessage[],
  opts?: { recentActivity?: boolean; enableAI?: boolean }
): {
  analysis: ConnectionAnalysis | null
  metrics: SyncMetrics | null
  milestones: TimelineMilestone[]
  aiInsight: string | null
  aiLoading: boolean
  aiEnhanced: boolean
  ai: AIConnectionAnalysis | null
  atmosphere: AIAtmosphereProfile | null
  aiMemories: ReturnType<typeof mergeAndPersistAIMemories>
} {
  const { locale, t } = useI18n()
  const recentActivity = opts?.recentActivity ?? false
  const enableAI = opts?.enableAI !== false
  const [aiResult, setAiResult] = useState<AIConnectionAnalysis | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const localBundle = useMemo(() => {
    if (!view) {
      return {
        analysis: null as ConnectionAnalysis | null,
        metrics: null as SyncMetrics | null,
        milestones: [] as TimelineMilestone[],
        signals: null,
      }
    }
    const record = getConnection(view.profileId)
    if (!record) {
      const metrics = deriveSyncMetrics(view, { recentActivity })
      return { analysis: null, metrics, milestones: [], signals: null }
    }

    const signals = extractAIConnectionSignals(messages, record)
    const analysis = analyzeConnection(view, messages, record, { recentActivity })
    const metrics = deriveSyncMetrics(view, {
      recentActivity,
      messages,
      record,
    })
    const milestones = buildConnectionMilestones(messages, record, analysis.syncPercent)
    return { analysis, metrics, milestones, signals, record }
  }, [view, messages, recentActivity])

  useEffect(() => {
    if (!enableAI || !view) {
      setAiResult(null)
      return
    }
    const record = getConnection(view.profileId)
    if (!record || messages.length === 0) {
      setAiResult(null)
      return
    }

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const timer = window.setTimeout(async () => {
      setAiLoading(true)
      const body = buildAnalyzeConnectionRequest(
        view.profileId,
        locale,
        messages,
        record,
        view
      )
      const data = await fetchConnectionAIAnalysis(body, { signal: ac.signal })
      if (!ac.signal.aborted) {
        setAiResult(data)
        setAiLoading(false)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      ac.abort()
    }
  }, [enableAI, view, messages, locale, recentActivity])

  const merged = useMemo(() => {
    if (!localBundle.analysis || !localBundle.metrics || !view) {
      return {
        ...localBundle,
        ai: null as AIConnectionAnalysis | null,
        atmosphere: null as AIAtmosphereProfile | null,
        aiInsight: null as string | null,
        aiMemories: [] as ReturnType<typeof mergeAndPersistAIMemories>,
      }
    }

    const record = getConnection(view.profileId)!
    const detectedMemories = detectAIMemories(
      messages,
      record,
      localBundle.signals!,
      localBundle.analysis.syncPercent,
      t
    )

    if (!aiResult) {
      const connectionState = resolveAIConnectionState(null, localBundle.analysis, view)
      const personality = normalizePersonality(
        resolveRelationshipPersonality(null, localBundle.analysis, localBundle.signals, view)
      )
      const evolutionStage = resolveEvolutionStage(
        localBundle.analysis.syncPercent,
        view.isFading,
        view.bothParticipated
      )
      const relAura = buildConnectionAura(
        personality,
        evolutionStage,
        localBundle.analysis.syncPercent
      )
      const aiMemories = mergeAndPersistAIMemories(view.profileId, detectedMemories)
      return {
        analysis: localBundle.analysis,
        metrics: {
          ...localBundle.metrics,
          aiConnectionState: connectionState,
          connectionPersonality: personality,
          atmosphereLevel: relAura.intensity * 100,
          atmosphereGlow: relAura.intensity,
          atmosphereMotion: relAura.intensity,
          atmosphereParticles: relAura.particles === "none" ? 0 : 0.5,
        },
        milestones: localBundle.milestones,
        ai: null,
        atmosphere: null,
        aiInsight: pickAIInsight(null, localBundle.analysis, localBundle.signals, recentActivity, t),
        aiMemories,
      }
    }

    const { analysis, metrics, ai } = mergeAnalysisWithAI(
      localBundle.analysis,
      aiResult,
      view,
      localBundle.signals
    )
    const aiMemories = mergeAndPersistAIMemories(
      view.profileId,
      mergeAIMemories(detectedMemories, ai.memories)
    )
    const evolutionStage = resolveEvolutionStage(
      metrics.syncPercent,
      view.isFading,
      view.bothParticipated
    )
    const relAura = buildConnectionAura(
      normalizePersonality(metrics.connectionPersonality ?? "slow_burn"),
      evolutionStage,
      metrics.syncPercent,
      metrics.atmosphereGlow
    )

    return {
      analysis,
      metrics: {
        ...metrics,
        atmosphereGlow: relAura.intensity,
        atmosphereMotion: relAura.intensity,
        atmosphereParticles: relAura.particles === "none" ? 0 : 0.55,
      },
      milestones: buildConnectionMilestones(messages, record, analysis.syncPercent),
      ai,
      atmosphere: null,
      aiInsight: pickAIInsight(ai, analysis, localBundle.signals, recentActivity, t),
      aiMemories,
    }
  }, [localBundle, aiResult, view, messages, recentActivity, t])

  return {
    analysis: merged.analysis,
    metrics: merged.metrics,
    milestones: merged.milestones,
    aiInsight: merged.aiInsight ?? merged.metrics?.insight ?? aiResult?.insight ?? null,
    aiLoading,
    aiEnhanced: Boolean(aiResult?.source === "openrouter" || merged.metrics?.aiEnhanced),
    ai: merged.ai,
    atmosphere: merged.atmosphere,
    aiMemories: merged.aiMemories,
  }
}
