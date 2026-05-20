"use client"

import { useReducedMotion } from "motion/react"
import type { SyncTier } from "@/lib/sync-system"
import { cn } from "@/lib/utils"

type SyncAmbientFieldProps = {
  tier?: SyncTier
  intensity?: number
  className?: string
}

export function SyncAmbientField({ tier = "soft", intensity = 0.5, className }: SyncAmbientFieldProps) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div
      className={cn("sync-ambient", `sync-ambient--${tier}`, className)}
      aria-hidden
      style={{ opacity: Math.min(1, intensity * 1.2) }}
    >
      <div
        className="sync-ambient__blob"
        style={{
          background:
            tier === "synced" || tier === "vibrant"
              ? "radial-gradient(ellipse, rgba(200,190,255,0.35) 0%, transparent 70%)"
              : tier === "cold"
                ? "radial-gradient(ellipse, rgba(100,120,160,0.25) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(160,175,220,0.28) 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
