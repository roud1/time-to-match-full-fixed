"use client"

import { motion, useReducedMotion } from "motion/react"
import type { SyncTier } from "@/lib/sync-system"
import { cn } from "@/lib/utils"

type AnimatedConnectionBackgroundProps = {
  tier?: SyncTier
  intensity?: number
  emotionalGlow?: boolean
  className?: string
}

/** Cinematic ambient layer for chat / connection surfaces. */
export function AnimatedConnectionBackground({
  tier = "soft",
  intensity = 0.35,
  emotionalGlow = true,
  className,
}: AnimatedConnectionBackgroundProps) {
  const reduce = useReducedMotion()
  const alpha = Math.min(1, Math.max(0.08, intensity))

  return (
    <div
      className={cn("sync-ambient sync-ambient--layered pointer-events-none", `sync-ambient--${tier}`, className)}
      aria-hidden
    >
      <span
        className="sync-ambient__blob sync-ambient__blob--a"
        style={{ opacity: alpha * 0.9 }}
      />
      {emotionalGlow && (
        <motion.span
          className="sync-ambient__blob sync-ambient__blob--b"
          style={{ opacity: alpha * 0.65 }}
          animate={
            reduce
              ? undefined
              : {
                  scale: [1, 1.08, 1],
                  opacity: [alpha * 0.5, alpha * 0.75, alpha * 0.5],
                }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!reduce && tier === "synced" && (
        <span className="sync-ambient__heartbeat" style={{ opacity: alpha * 0.4 }} />
      )}
    </div>
  )
}
