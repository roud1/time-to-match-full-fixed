"use client"

import { useReducedMotion } from "motion/react"
import { useEmotionalWorld } from "@/hooks/use-emotional-world"
import { cn } from "@/lib/utils"

type LiveEmotionalFieldProps = {
  className?: string
}

export function LiveEmotionalField({ className }: LiveEmotionalFieldProps) {
  const reduce = useReducedMotion()
  const world = useEmotionalWorld()

  if (reduce) return null

  const waveDuration = `${22 / world.atmosphere.waveSpeed}s`

  return (
    <div
      className={cn("world-live-field", className)}
      aria-hidden
      data-world-pulse={Math.round(world.pulse * 100)}
      style={
        {
          ["--eco-world-energy" as string]: String(world.energy),
          ["--eco-world-energy-b" as string]: String(world.energy * 0.85),
          ["--world-live-motion" as string]: String(world.liveMotion),
        } as React.CSSProperties
      }
    >
      <div className="world-live-field__wave world-live-field__wave--a" style={{ animationDuration: waveDuration }} />
      <div className="world-live-field__wave world-live-field__wave--b" style={{ animationDuration: waveDuration }} />
      <div className="eco-world-field__orb eco-world-field__orb--a" />
      <div className="eco-world-field__orb eco-world-field__orb--b" />
      <div className="world-live-field__particles">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="world-live-field__particle" />
        ))}
      </div>
    </div>
  )
}
