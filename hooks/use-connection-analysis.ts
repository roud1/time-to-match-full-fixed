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
import type { ConnectionAIAnalysisResponse } from "@/lib/connection-ai-types"
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
} {
  const { locale } = useI18n()
  const recentActivity = opts?.recentActivity ?? false
  const enableAI = opts?.enableAI !== false
  const [aiResult, setAiResult] = useState<ConnectionAIAnalysisResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const localBundle = useMemo(() => {
    if (!view) {
      return { analysis: null as ConnectionAnalysis | null, metrics: null as SyncMetrics | null, milestones: [] as TimelineMilestone[] }
    }
    const record = getConnection(view.profileId)
    if (!record) {
      const metrics = deriveSyncMetrics(view, { recentActivity })
      return { analysis: null, metrics, milestones: [] }
    }

    const analysis = analyzeConnection(view, messages, record, { recentActivity })
    const metrics = deriveSyncMetrics(view, {
      recentActivity,
      messages,
      record,
    })
    const milestones = buildConnectionMilestones(messages, record, analysis.syncPercent)
    return { analysis, metrics, milestones }
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
    }, 600)

    return () => {
      clearTimeout(timer)
      ac.abort()
    }
  }, [enableAI, view, messages, locale, recentActivity])

  const merged = useMemo(() => {
    if (!localBundle.analysis || !localBundle.metrics || !view) {
      return localBundle
    }
    if (!aiResult) {
      return localBundle
    }
    const { analysis, metrics } = mergeAnalysisWithAI(
      localBundle.analysis,
      aiResult,
      view.isFading
    )
    return {
      analysis,
      metrics,
      milestones: buildConnectionMilestones(
        messages,
        getConnection(view.profileId)!,
        analysis.syncPercent
      ),
    }
  }, [localBundle, aiResult, view, messages])

  return {
    analysis: merged.analysis,
    metrics: merged.metrics,
    milestones: merged.milestones,
    aiInsight: aiResult?.insight ?? merged.metrics?.insight ?? null,
    aiLoading,
    aiEnhanced: Boolean(aiResult?.source === "openrouter" || merged.metrics?.aiEnhanced),
  }
}
