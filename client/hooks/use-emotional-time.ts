"use client"

import { useEffect, useMemo, useState } from "react"
import type { ConnectionAnalysis } from "@/client/lib/connection-engine"
import type { ConnectionRecord } from "@/client/lib/connection-system"
import type { ChatMessage } from "@/client/lib/social-store"
import type { EmotionalReality } from "@/client/lib/reality"
import { analyzeEmotionalTime, type EmotionalTime } from "@/client/lib/time"

export function useEmotionalTime(
  profileId: number,
  record: ConnectionRecord | null | undefined,
  messages: ChatMessage[],
  analysis: ConnectionAnalysis | null,
  syncPercent: number,
  reality: EmotionalReality | null,
  options?: { recentActivity?: boolean }
): EmotionalTime | null {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const id = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => clearInterval(id)
  }, [])

  return useMemo(() => {
    if (!record || !analysis) return null
    return analyzeEmotionalTime(profileId, record, messages, analysis, syncPercent, {
      hour,
      recentActivity: options?.recentActivity,
      realityStyle: reality?.style,
      realityAttrs: reality?.attrs,
    })
  }, [
    profileId,
    record,
    messages,
    analysis,
    syncPercent,
    hour,
    options?.recentActivity,
    reality?.style,
    reality?.attrs,
  ])
}
