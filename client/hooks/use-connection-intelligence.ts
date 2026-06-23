"use client"

import { useEffect, useMemo, useState } from "react"
import type { ConnectionView } from "@/client/lib/connection-system"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import {
  analyzeConnectionIntelligence,
  type ConnectionIntelligence,
} from "@/client/lib/intelligence"

export function useConnectionIntelligence(
  view: ConnectionView | null,
  analysis: ConnectionAnalysis | null,
  messages: ChatMessage[],
  record: ConnectionRecord | null | undefined
): ConnectionIntelligence | null {
  const [prevSync, setPrevSync] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (analysis) setPrevSync(analysis.syncPercent)
  }, [analysis])

  return useMemo(() => {
    if (!view || !analysis || !record) return null
    return analyzeConnectionIntelligence(view, analysis, messages, record, prevSync)
  }, [view, analysis, messages, record, prevSync])
}
