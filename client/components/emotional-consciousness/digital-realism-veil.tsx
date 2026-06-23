"use client"

import { useReducedMotion } from "motion/react"
import type { AtmosphericConsciousness } from "@/client/lib/emotional-consciousness"
import type { SilenceUnderstanding } from "@/client/lib/emotional-consciousness"
import { cn } from "@/client/lib/utils"

type DigitalRealismVeilProps = {
  atmosphere: AtmosphericConsciousness
  silence: SilenceUnderstanding
  className?: string
}

/** Phase 22 — cinematic emptiness, breathing, emotional depth. */
export function DigitalRealismVeil({
  atmosphere,
  silence,
  className,
}: DigitalRealismVeilProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("ec-realism-veil", className)}
      aria-hidden
      data-ec-realism="true"
      style={{
        ["--ec-realism-breath" as string]: String(
          (atmosphere.cinematicStillness + silence.stillness) / 2
        ),
        ["--ec-realism-emptiness" as string]: String(atmosphere.visualSilence),
        animationDuration: reduce ? "0ms" : "4.8s",
      }}
    />
  )
}
