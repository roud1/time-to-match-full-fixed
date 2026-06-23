"use client"

import { useReducedMotion } from "motion/react"
import { useGlobalAtmosphere } from "@/client/hooks/use-global-atmosphere"
import { cn } from "@/client/lib/utils"

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
