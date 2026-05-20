"use client"

import { useMemo } from "react"
import type { ChatMessage } from "@/lib/social-store"
import { cn } from "@/lib/utils"

type SyncTimelineProps = {
  messages: ChatMessage[]
  matchedAt?: number
  className?: string
}

const BUCKETS = 12

export function SyncTimeline({ messages, matchedAt, className }: SyncTimelineProps) {
  const heights = useMemo(() => {
    const now = Date.now()
    const start = matchedAt ?? (messages[0]?.at ?? now - 7 * 24 * 60 * 60 * 1000)
    const span = Math.max(now - start, 60_000)
    const counts = Array.from({ length: BUCKETS }, () => 0)
    for (const m of messages) {
      const idx = Math.min(
        BUCKETS - 1,
        Math.floor(((m.at - start) / span) * BUCKETS)
      )
      if (idx >= 0) counts[idx] += 1
    }
    const max = Math.max(1, ...counts)
    return counts.map((c) => Math.max(12, Math.round((c / max) * 100)))
  }, [messages, matchedAt])

  return (
    <div className={cn("sync-timeline", className)} role="img" aria-label="Shared activity timeline">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn("sync-timeline__tick", h > 20 && "sync-timeline__tick--lit")}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
