"use client"

import { useMemo } from "react"
import { usePresenceRealtime } from "@/client/hooks/use-presence-realtime"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionIntelligence } from "@/client/lib/intelligence"
import type { SyncMetrics } from "@/client/lib/sync-system"
import type { ChatThread } from "@/client/lib/social-store"
import type { EmotionalTime } from "@/client/lib/time"
import {
  analyzeEmotionalPresenceSystem,
  type EmotionalPresenceSystem,
} from "@/client/lib/presence"

export function useEmotionalPresenceSystem(
  profileId: number,
  options: {
    thread?: ChatThread | null
    view?: ConnectionView | null
    syncMetrics?: SyncMetrics | null
    analysis: ConnectionAnalysis | null
    intelligence?: ConnectionIntelligence | null
    emotionalTime?: EmotionalTime | null
    recentActivity?: boolean
    syncSurge?: boolean
  }
): EmotionalPresenceSystem | null {
  const tick = usePresenceRealtime({ profileId })
  const hour = useMemo(() => {
    void tick
    return new Date().getHours()
  }, [tick])

  return useMemo(() => {
    void tick
    if (!options.analysis) return null
    return analyzeEmotionalPresenceSystem(profileId, {
      thread: options.thread,
      view: options.view,
      syncMetrics: options.syncMetrics,
      analysis: options.analysis,
      intelligence: options.intelligence,
      hour,
      recentActivity: options.recentActivity,
      syncSurge: options.syncSurge,
      baseStyle: options.emotionalTime?.style,
      baseAttrs: options.emotionalTime?.attrs,
    })
  }, [
    profileId,
    tick,
    hour,
    options.thread,
    options.view,
    options.syncMetrics,
    options.analysis,
    options.intelligence,
    options.emotionalTime?.style,
    options.emotionalTime?.attrs,
    options.recentActivity,
    options.syncSurge,
  ])
}
