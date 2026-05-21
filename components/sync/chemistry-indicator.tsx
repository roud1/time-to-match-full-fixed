"use client"

import type { SyncMetrics } from "@/lib/sync-system"
import { cn } from "@/lib/utils"

type ChemistryIndicatorProps = {
  metrics: SyncMetrics
  label: string
  className?: string
}

export function ChemistryIndicator({ metrics, label, className }: ChemistryIndicatorProps) {
  const value = metrics.chemistryPercent
  const lit = value >= 55

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 backdrop-blur-md",
        lit ? "border-white/18 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]",
        metrics.isSynced && "shadow-[0_0_20px_-8px_rgba(255,255,255,0.12)]",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0 transition-all duration-500",
          lit ? "w-1.5 h-1.5 bg-white/70" : "w-1 h-1 bg-white/35"
        )}
        aria-hidden
      />
      <span className="text-[9px] uppercase tracking-[0.14em] text-white/45 font-extralight">{label}</span>
      <span className="text-[10px] tabular-nums text-white/75 font-extralight">{value}%</span>
    </div>
  )
}
