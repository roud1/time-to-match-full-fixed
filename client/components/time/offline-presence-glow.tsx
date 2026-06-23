"use client"

import type { OfflinePresence } from "@/client/lib/time"
import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type OfflinePresenceGlowProps = {
  presence: OfflinePresence
  className?: string
}

export function OfflinePresenceGlow({ presence, className }: OfflinePresenceGlowProps) {
  const reduce = useReducedMotion()
  if (reduce || !presence.active) return null

  return (
    <div
      className={cn("p17-offline-glow", className)}
      aria-hidden
      style={{
        ["--time-offline-glow" as string]: String(presence.glow),
        ["--time-offline-drift" as string]: String(presence.drift),
      }}
    />
  )
}
