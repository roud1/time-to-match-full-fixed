"use client"

import { useReducedMotion } from "motion/react"
import type { SyncMetrics } from "@/client/lib/sync-system"
import { cn } from "@/client/lib/utils"

type ConnectionPulseLayerProps = {
  syncMetrics: SyncMetrics | null
  surge?: boolean
  className?: string
}

export function ConnectionPulseLayer({ syncMetrics, surge, className }: ConnectionPulseLayerProps) {
  const reduce = useReducedMotion()
  if (reduce || !syncMetrics) return null

  const intensity = Math.min(1, syncMetrics.syncPercent / 100)

  return (
    <div
      className={cn("world-connection-pulse", surge && "world-connection-pulse--surge", className)}
      aria-hidden
      data-sync-tier={syncMetrics.tier}
      style={{ ["--pulse-intensity" as string]: String(intensity) }}
    />
  )
}
