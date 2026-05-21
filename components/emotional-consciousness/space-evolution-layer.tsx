"use client"

import type { SpaceEvolution } from "@/lib/emotional-consciousness"
import { cn } from "@/lib/utils"

type SpaceEvolutionLayerProps = {
  space: SpaceEvolution
  className?: string
}

/** Phase 22 — shared relationship space matures over time. */
export function SpaceEvolutionLayer({ space, className }: SpaceEvolutionLayerProps) {
  return (
    <div
      className={cn("ec-space-evolution", className)}
      aria-hidden
      style={{
        ["--ec-space-maturity" as string]: String(space.maturity),
        ["--ec-space-aura" as string]: String(space.auraDepth),
        ["--ec-space-light" as string]: String(space.lightSoftness),
      }}
    />
  )
}
