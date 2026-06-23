"use client"

import { useReducedMotion } from "motion/react"
import type { ConnectionResonance } from "@/client/lib/presence"
import { cn } from "@/client/lib/utils"

type ConnectionResonanceLayerProps = {
  resonance: ConnectionResonance
  className?: string
}

export function ConnectionResonanceLayer({ resonance, className }: ConnectionResonanceLayerProps) {
  const reduce = useReducedMotion()
  if (reduce || resonance.level < 0.25) return null

  return (
    <div
      className={cn("p18-resonance-layer", className)}
      aria-hidden
      style={{
        ["--pres-resonance" as string]: String(resonance.level),
        ["--pres-pulse-align" as string]: String(resonance.pulseAlign),
        ["--pres-aura-merge" as string]: String(resonance.auraMerge),
        ["--pres-wave-intensity" as string]: String(resonance.waveIntensity),
      }}
    >
      <div className="p18-resonance-layer__wave" />
      <div className="p18-resonance-layer__align" />
      <div className="p18-resonance-layer__merge" />
    </div>
  )
}
