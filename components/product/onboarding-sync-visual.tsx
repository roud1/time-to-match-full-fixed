"use client"

import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type OnboardingSyncVisualProps = {
  className?: string
  intensity?: "soft" | "vivid"
}

export function OnboardingSyncVisual({ className, intensity = "soft" }: OnboardingSyncVisualProps) {
  const reduce = useReducedMotion()

  return (
    <div
      className={cn("p9-sync-visual", intensity === "vivid" && "scale-105", className)}
      aria-hidden
    >
      <div className={cn("p9-sync-visual__orbit", !reduce && "p9-sync-visual__orbit")} />
      <div className={cn("p9-sync-visual__orbit p9-sync-visual__orbit--inner", !reduce && "p9-sync-visual__orbit--inner")} />
      <div className={cn("p9-sync-visual__line", !reduce && "p9-sync-visual__line")} />
      <span className="p9-sync-visual__node p9-sync-visual__node--left" />
      <span className="p9-sync-visual__node p9-sync-visual__node--right" />
      <div className="absolute inset-[38%] rounded-full border border-white/12 bg-white/[0.06] backdrop-blur-sm" />
    </div>
  )
}
