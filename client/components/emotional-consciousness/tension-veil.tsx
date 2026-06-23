"use client"

import { useReducedMotion } from "motion/react"
import type { RelationshipTension } from "@/client/lib/emotional-consciousness"
import { cn } from "@/client/lib/utils"

type TensionVeilProps = {
  tension: RelationshipTension
  className?: string
}

/** Phase 22 — tension drives motion, glow, gradients. */
export function TensionVeil({ tension, className }: TensionVeilProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("ec-tension-veil", className)}
      aria-hidden
      data-ec-tension={tension.kind}
      style={{
        ["--ec-tension-motion" as string]: String(tension.motionTension),
        ["--ec-tension-glow" as string]: String(tension.glowTension),
        ["--ec-tension-gradient" as string]: String(tension.gradientPull),
        transitionDuration: reduce ? "0ms" : "1.2s",
      }}
    />
  )
}
