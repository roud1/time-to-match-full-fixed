"use client"

import { useReducedMotion } from "motion/react"
import type { PresenceImmersion } from "@/client/lib/reality-expansion"
import { cn } from "@/client/lib/utils"

type PresenceProximityLayerProps = {
  immersion: PresenceImmersion
  className?: string
}

export function PresenceProximityLayer({ immersion, className }: PresenceProximityLayerProps) {
  const reduce = useReducedMotion()
  if (immersion.proximity < 0.2) return null

  return (
    <div
      className={cn("er-proximity-layer", !reduce && "er-proximity-layer--pulse", className)}
      aria-hidden
      style={{
        ["--er-proximity" as string]: String(immersion.proximity),
        ["--er-aura-radius" as string]: String(immersion.auraRadius),
        ["--er-res-pulse" as string]: String(immersion.resonancePulse),
      }}
    >
      <div className="er-proximity-layer__field" />
      <div className="er-proximity-layer__ring" />
    </div>
  )
}
