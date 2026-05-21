"use client"

import { useReducedMotion } from "motion/react"
import type { CinematicEmotionalState } from "@/lib/reality-expansion"
import { cn } from "@/lib/utils"

type CinematicStateVeilProps = {
  cinematic: CinematicEmotionalState
  className?: string
}

export function CinematicStateVeil({ cinematic, className }: CinematicStateVeilProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("er-cinematic-veil", className)}
      aria-hidden
      data-er-cinematic={cinematic.id}
      style={{
        ["--er-cine-motion" as string]: String(cinematic.motionPace),
        ["--er-cine-glow" as string]: String(cinematic.glowDepth),
        ["--er-cine-blur" as string]: String(cinematic.blurDepth),
      }}
    />
  )
}
