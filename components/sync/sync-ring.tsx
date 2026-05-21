"use client"

import { motion, useReducedMotion } from "motion/react"
import type { CSSProperties, ReactNode } from "react"
import type { SyncMetrics } from "@/lib/sync-system"
import type { RelationshipPersonality } from "@/lib/relationship-identity/types"
import { cn } from "@/lib/utils"

type SyncRingProps = {
  metrics: SyncMetrics | null
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  /** Disable breathing scale animation (e.g. landing hero — keeps circle perfectly round). */
  steady?: boolean
  aiBoost?: boolean
  syncSurge?: boolean
  relationshipPersonality?: RelationshipPersonality
  evolutionProgress?: number
  children: ReactNode
}

const SIZE_CLASS = {
  xs: "w-12 h-12",
  sm: "w-14 h-14",
  md: "w-16 h-16",
  lg: "w-24 h-24",
} as const

function syncBandClass(percent: number, tier: string): string {
  if (percent < 20) return "sync-ring--weak"
  if (percent < 50) return "sync-ring--soft-band"
  if (percent < 80) return "sync-ring--mid-band"
  return tier === "synced" ? "sync-ring--peak-band" : "sync-ring--high-band"
}

export function SyncRing({
  metrics,
  size = "md",
  className,
  steady,
  aiBoost,
  syncSurge,
  relationshipPersonality,
  evolutionProgress,
  children,
}: SyncRingProps) {
  const reduce = useReducedMotion()
  const tier = metrics?.tier ?? "cold"
  const p = metrics?.syncPercent ?? 12
  const breathe =
    p >= 80 || tier === "vibrant" || tier === "synced"
      ? { scale: [1, 1.05, 1], opacity: [0.88, 1, 0.88] }
      : p >= 50
        ? { scale: [1, 1.035, 1], opacity: [0.78, 0.95, 0.78] }
        : { scale: [1, 1.02, 1], opacity: [0.55, 0.82, 0.55] }

  const showWaves = p >= 45 && !steady

  return (
    <motion.div
      className={cn(
        "sync-ring ttm-gpu-layer",
        SIZE_CLASS[size],
        `sync-ring--${tier}`,
        syncBandClass(p, tier),
        metrics?.isFading && "sync-ring--fading",
        metrics?.recentActivity && "sync-ring--live",
        (metrics?.aiEnhanced || aiBoost) && "sync-ring--ai",
        syncSurge && "sync-ring--surge",
        showWaves && "sync-ring--waves",
        className
      )}
      data-rel-personality={relationshipPersonality}
      data-rel-evolution={
        evolutionProgress != null ? String(Math.round(evolutionProgress * 100)) : undefined
      }
      style={{ "--sync-p": p } as CSSProperties}
      animate={reduce || steady ? undefined : breathe}
      transition={{
        duration: tier === "synced" ? 3.2 : 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <span className="sync-ring__halo" aria-hidden />
      <span className="sync-ring__track" aria-hidden />
      <span className="sync-ring__pulse" aria-hidden />
      {showWaves && (
        <>
          <span className="sync-ring__wave sync-ring__wave--a" aria-hidden />
          <span className="sync-ring__wave sync-ring__wave--b" aria-hidden />
          <span className="sync-ring__trail" aria-hidden />
        </>
      )}
      <div className="sync-ring__inner h-full w-full">{children}</div>
    </motion.div>
  )
}
