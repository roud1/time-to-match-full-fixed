"use client"

import { useMemo } from "react"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import type { EmotionalCompanion } from "@/client/lib/companion"
import type { SyncMetrics } from "@/client/lib/sync-system"
import { analyzeEmotionalReality, type EmotionalReality } from "@/client/lib/reality"

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
