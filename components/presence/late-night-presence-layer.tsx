"use client"

import type { LateNightPresence } from "@/lib/presence"
import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type LateNightPresenceLayerProps = {
  lateNight: LateNightPresence
  className?: string
}

export function LateNightPresenceLayer({ lateNight, className }: LateNightPresenceLayerProps) {
  const reduce = useReducedMotion()
  if (reduce || !lateNight.active) return null

  return (
    <>
      <div
        className={cn("p18-late-night", className)}
        aria-hidden
        style={{
          ["--pres-night-depth" as string]: String(lateNight.depth),
          ["--pres-night-intimacy" as string]: String(lateNight.intimacy),
          ["--pres-night-motion" as string]: String(lateNight.motion),
        }}
      />
      <div className="p18-late-night__glow" aria-hidden />
    </>
  )
}
