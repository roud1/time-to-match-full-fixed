"use client"

import type { SyncMetrics } from "@/client/lib/sync-system"
import { cn } from "@/client/lib/utils"

type ConnectionProgressProps = {
  metrics: SyncMetrics
  label: string
  className?: string
  size?: "sm" | "md"
}

export function ConnectionProgress({ metrics, label, className, size = "md" }: ConnectionProgressProps) {
  const value = metrics.connectionPercent
  return (
    <div className={cn("sync-metric-block", className)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={cn(
            "uppercase tracking-[0.18em] text-white/35 font-extralight",
            size === "sm" ? "text-[8px]" : "text-[9px]"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "tabular-nums text-white/70 font-extralight",
            size === "sm" ? "text-[9px]" : "text-[10px]"
          )}
        >
          {value}%
        </span>
      </div>
      <div className={cn("sync-metric-bar", size === "sm" ? "h-[2px]" : "h-[3px]")}>
        <div
          className={cn(
            "sync-metric-bar__fill transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            metrics.isFading && "opacity-60"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
