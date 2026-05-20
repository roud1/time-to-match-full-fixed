"use client"

import type { CSSProperties, ReactNode } from "react"
import type { SyncMetrics } from "@/lib/sync-system"
import { cn } from "@/lib/utils"

type SyncRingProps = {
  metrics: SyncMetrics | null
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
  children: ReactNode
}

const SIZE_CLASS = {
  xs: "w-12 h-12",
  sm: "w-14 h-14",
  md: "w-16 h-16",
  lg: "w-24 h-24",
} as const

export function SyncRing({ metrics, size = "md", className, children }: SyncRingProps) {
  const tier = metrics?.tier ?? "cold"
  const p = metrics?.syncPercent ?? 12

  return (
    <div
      className={cn(
        "sync-ring",
        SIZE_CLASS[size],
        `sync-ring--${tier}`,
        metrics?.isFading && "sync-ring--fading",
        className
      )}
      style={
        {
          "--sync-p": p,
        } as CSSProperties
      }
    >
      <span className="sync-ring__halo" aria-hidden />
      <span className="sync-ring__track" aria-hidden />
      <span className="sync-ring__pulse" aria-hidden />
      <div className="sync-ring__inner h-full w-full">{children}</div>
    </div>
  )
}
