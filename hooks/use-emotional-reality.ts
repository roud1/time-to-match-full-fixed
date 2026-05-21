"use client"

import { useMemo } from "react"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionIntelligence } from "@/lib/intelligence"
import type { EmotionalCompanion } from "@/lib/companion"
import type { SyncMetrics } from "@/lib/sync-system"
import { analyzeEmotionalReality, type EmotionalReality } from "@/lib/reality"

export function useEmotionalReality(
  intelligence: ConnectionIntelligence | null,
  analysis: ConnectionAnalysis | null,
  companion: EmotionalCompanion | null,
  syncMetrics: SyncMetrics | null,
  options?: { syncSurge?: boolean }
): EmotionalReality | null {
  return useMemo(() => {
    if (!intelligence || !analysis) return null
    return analyzeEmotionalReality(intelligence, analysis, companion, syncMetrics, options)
  }, [intelligence, analysis, companion, syncMetrics, options?.syncSurge])
}
