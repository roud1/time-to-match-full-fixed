"use client"

import { useReducedMotion } from "motion/react"
import type { EmotionalContinuity } from "@/lib/emotional-os"
import { cn } from "@/lib/utils"

type ContinuityBreathProps = {
  continuity: EmotionalContinuity
  className?: string
}

/** Slow sync breath — relationship continues offline. */
export function ContinuityBreath({ continuity, className }: ContinuityBreathProps) {
  const reduce = useReducedMotion()
  if (!continuity.active || reduce) return null

  return (
    <div
      className={cn("eo-continuity-breath", className)}
      aria-hidden
      style={{
        ["--eo-continuity-breath" as string]: String(continuity.breathRate),
        ["--eo-presence-remain" as string]: String(continuity.presenceRemain),
      }}
    />
  )
}
