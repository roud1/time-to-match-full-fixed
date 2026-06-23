"use client"

import { useReducedMotion } from "motion/react"
import type { EmotionalOrchestration } from "@/client/lib/emotional-os"
import { cn } from "@/client/lib/utils"

type OrchestratorVeilProps = {
  orchestration: EmotionalOrchestration
  className?: string
}

/** Invisible emotional director layer — pacing + light diffusion. */
export function OrchestratorVeil({ orchestration, className }: OrchestratorVeilProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("eo-orchestrator-veil", className)}
      aria-hidden
      data-eo-pacing={orchestration.pacing}
      data-eo-lighting={orchestration.lighting}
      style={{
        ["--eo-atmo-shift" as string]: String(orchestration.atmosphereShift),
        ["--eo-transition-ms" as string]: String(orchestration.transitionMs),
        ["--eo-motion-scale" as string]: String(orchestration.motionScale),
        transitionDuration: reduce ? "0ms" : `${orchestration.transitionMs}ms`,
      }}
    />
  )
}
