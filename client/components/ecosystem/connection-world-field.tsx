"use client"

import { useReducedMotion } from "motion/react"
import { useConnectionWorldEnergy } from "@/client/hooks/use-connection-world-energy"
import { cn } from "@/client/lib/utils"

type ConnectionWorldFieldProps = {
  className?: string
}

export function ConnectionWorldField({ className }: ConnectionWorldFieldProps) {
  const reduce = useReducedMotion()
  const energy = useConnectionWorldEnergy()

  if (reduce) return null

  return (
    <div
      className={cn("eco-world-field", className)}
      aria-hidden
      style={
        {
          ["--eco-world-energy" as string]: String(energy),
          ["--eco-world-energy-b" as string]: String(energy * 0.85),
        } as React.CSSProperties
      }
    >
      <div className="eco-world-field__orb eco-world-field__orb--a" />
      <div className="eco-world-field__orb eco-world-field__orb--b" />
    </div>
  )
}
