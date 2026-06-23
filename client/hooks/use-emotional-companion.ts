"use client"

import { useMemo } from "react"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import {
  analyzeEmotionalCompanion,
  type EmotionalCompanion,
} from "@/client/lib/companion"

export function useEmotionalCompanion(
  profileId: number,
  intelligence: ConnectionIntelligence | null,
  analysis: ConnectionAnalysis | null,
  messageCount: number,
  options?: {
    syncSurge?: boolean
    recentActivity?: boolean
    enableReflection?: boolean
  }
): EmotionalCompanion | null {
  return useMemo(() => {
    if (!intelligence || !analysis) return null
    return analyzeEmotionalCompanion(profileId, intelligence, analysis, messageCount, {
      syncSurge: options?.syncSurge,
      recentActivity: options?.recentActivity,
      showReflection: options?.enableReflection ?? true,
    })
  }, [
    profileId,
    intelligence,
    analysis,
    messageCount,
    options?.syncSurge,
    options?.recentActivity,
    options?.enableReflection,
  ])
}
