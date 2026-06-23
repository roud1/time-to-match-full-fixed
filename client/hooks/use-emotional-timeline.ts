"use client"

import { useMemo } from "react"
import type { EmotionalTimelineEntry } from "@/client/lib/time"
import { buildEmotionalTimeline, resolveRelationshipTimeState } from "@/client/lib/time"
import { analyzeConnection } from "@/client/lib/connection-engine"
import { buildConnectionView } from "@/client/lib/connection-system"
import { getActiveConnections, getConnection } from "@/client/lib/connection-store"
import { getChatMessagesForProfile } from "@/client/lib/social-store"
import { deriveSyncMetrics } from "@/client/lib/sync-system"

export function useEmotionalTimeline(profileId?: number): EmotionalTimelineEntry[] {
  return useMemo(() => {
    const record = profileId
      ? getConnection(profileId)
      : getActiveConnections().sort((a, b) => b.lastInteractionAt - a.lastInteractionAt)[0]
    if (!record) return []

    const view = buildConnectionView(record)
    const messages = getChatMessagesForProfile(record.profileId)
    const analysis = analyzeConnection(view, messages, record)
    const sync = deriveSyncMetrics(view, { messages, record })
    if (!sync) return []
    const timeState = resolveRelationshipTimeState(record, analysis, messages)
    return buildEmotionalTimeline(messages, record, sync.syncPercent, timeState)
  }, [profileId])
}
