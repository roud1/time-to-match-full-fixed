"use client"

import type { ConnectionView } from "@/lib/connection-system"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { ConnectionStreakBadge } from "@/components/connection/connection-streak-badge"
import { cn } from "@/lib/utils"

type ConnectionChipProps = {
  view: ConnectionView
  stageLabel: string
  stableLabel: string
  className?: string
}

export function ConnectionChip({ view, stageLabel, stableLabel, className }: ConnectionChipProps) {
  return (
    <div className={cn("flex flex-col items-end gap-1 shrink-0", className)}>
      <span
        className={cn(
          "text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border font-light",
          view.isFading
            ? "border-amber-400/30 text-amber-200/90 bg-amber-500/10"
            : view.stage === "stable"
              ? "border-emerald-400/30 text-emerald-200/90 bg-emerald-500/10"
              : "border-white/14 text-white/80 bg-white/05"
        )}
      >
        {stageLabel}
      </span>
      <div className="flex items-center gap-1">
        {view.streakDays > 0 && <ConnectionStreakBadge days={view.streakDays} compact />}
        <ConnectionTimer view={view} compact stableLabel={stableLabel} />
      </div>
    </div>
  )
}
