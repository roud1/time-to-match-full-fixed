"use client"

import { cn } from "@/lib/utils"

export function ConnectionStreakBadge({ days, compact }: { days: number; compact?: boolean }) {
  if (days <= 0) return null
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-gradient-to-r from-orange-500/15 to-white/06 text-orange-100/95",
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[9px]",
        "font-light tracking-wide"
      )}
    >
      <span className="text-orange-300" aria-hidden>
        ◆
      </span>
      {days}
    </span>
  )
}
