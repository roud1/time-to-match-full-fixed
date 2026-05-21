"use client"

import { useMemo, useRef } from "react"
import type { ConnectionView } from "@/lib/connection-system"
import type { ConnectionAnalysis } from "@/lib/connection-engine"
import type { ConnectionRecord } from "@/lib/connection-system"
import type { ChatMessage } from "@/lib/social-store"
import {
  analyzeConnectionIntelligence,
  type ConnectionIntelligence,
} from "@/lib/intelligence"

export function useConnectionIntelligence(
  view: ConnectionView | null,
  analysis: ConnectionAnalysis | null,
  messages: ChatMessage[],
  record: ConnectionRecord | null | undefined
): ConnectionIntelligence | null {
  const prevSyncRef = useRef<number | undefined>(undefined)

  return useMemo(() => {
    if (!view || !analysis || !record) return null
    const intel = analyzeConnectionIntelligence(
      view,
      analysis,
      messages,
      record,
      prevSyncRef.current
    )
    prevSyncRef.current = analysis.syncPercent
    return intel
  }, [view, analysis, messages, record])
}
