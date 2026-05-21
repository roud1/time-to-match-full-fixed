"use client"

import { useReducedMotion } from "motion/react"
import type { AtmosphericConsciousness } from "@/lib/emotional-consciousness"
import { cn } from "@/lib/utils"

type ConsciousnessAtmosphereVeilProps = {
  atmosphere: AtmosphericConsciousness
  className?: string
}

/** Phase 22 — advanced atmospheric AI orchestration layer. */
export function ConsciousnessAtmosphereVeil({
  atmosphere,
  className,
}: ConsciousnessAtmosphereVeilProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("ec-atmosphere-veil", className)}
      aria-hidden
      style={{
        ["--ec-visual-silence" as string]: String(atmosphere.visualSilence),
        ["--ec-emotional-pacing" as string]: String(atmosphere.emotionalPacing),
        ["--ec-cinematic-still" as string]: String(atmosphere.cinematicStillness),
        ["--ec-ambient-move" as string]: String(atmosphere.ambientMovement),
        animationDuration: reduce ? "0ms" : `${2.4 + atmosphere.emotionalPacing}s`,
      }}
    />
  )
}
