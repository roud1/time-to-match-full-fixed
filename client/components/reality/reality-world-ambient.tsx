"use client"

import { useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"

type RealityWorldAmbientProps = {
  className?: string
}

/** Platform-wide live atmosphere motion (shell / memories). */
export function RealityWorldAmbient({ className }: RealityWorldAmbientProps) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className={cn("p16-world-ambient", className)} aria-hidden>
      <div className="p16-world-ambient__drift" />
      <div className="p16-world-ambient__glow" />
    </div>
  )
}
