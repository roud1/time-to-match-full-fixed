"use client"

import { useReducedMotion } from "motion/react"
import { useGlobalAtmosphere } from "@/hooks/use-global-atmosphere"
import { cn } from "@/lib/utils"

export function GlobalAtmosphereLayer({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const { tokens } = useGlobalAtmosphere()

  if (reduce) return null

  return (
    <div
      className={cn("world-atmosphere-layer", className)}
      aria-hidden
      data-atmosphere={tokens.period}
    />
  )
}
