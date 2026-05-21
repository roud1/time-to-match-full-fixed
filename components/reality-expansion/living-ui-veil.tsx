"use client"

import type { AdaptiveWorldAtmosphere } from "@/lib/reality-expansion"
import { cn } from "@/lib/utils"

type LivingUiVeilProps = {
  atmosphere: AdaptiveWorldAtmosphere
  className?: string
}

/** Breathing blur + light diffusion on UI chrome. */
export function LivingUiVeil({ atmosphere, className }: LivingUiVeilProps) {
  return (
    <div
      className={cn("er-living-ui-veil", className)}
      aria-hidden
      style={{
        ["--er-adaptive-glow" as string]: String(atmosphere.glowIntensity),
        ["--er-adaptive-blur" as string]: String(atmosphere.gradientDepth),
        transitionDuration: `${atmosphere.pacingMs}ms`,
      }}
    />
  )
}
