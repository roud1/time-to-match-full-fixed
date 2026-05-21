"use client"

import { useReducedMotion } from "motion/react"
import type { ConnectionResonance } from "@/lib/presence"
import type { LateNightPresence } from "@/lib/presence"
import { cn } from "@/lib/utils"

type PresenceImmersiveFieldProps = {
  resonance: ConnectionResonance
  lateNight: LateNightPresence
  className?: string
}

/** Layered depth, blur, particles — cinematic immersion pass (Phase 18). */
export function PresenceImmersiveField({
  resonance,
  lateNight,
  className,
}: PresenceImmersiveFieldProps) {
  const reduce = useReducedMotion()
  if (reduce || resonance.level < 0.18) return null

  return (
    <div
      className={cn("p18-immersive-field", lateNight.active && "p18-immersive-field--night", className)}
      aria-hidden
      style={{
        ["--pres-immersive" as string]: String(resonance.level),
        ["--pres-night-depth" as string]: String(lateNight.depth),
      }}
    >
      <div className="p18-immersive-field__depth" />
      <div className="p18-immersive-field__blur" />
      <div className="p18-immersive-field__particles">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="p18-immersive-field__particle" />
        ))}
      </div>
    </div>
  )
}
