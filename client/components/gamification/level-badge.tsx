"use client"

import { cn } from "@/client/lib/utils"

type LevelBadgeProps = {
  level: number
  className?: string
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5",
        "text-[11px] font-semibold tabular-nums",
        "bg-[var(--accent-soft-bg)] text-[var(--accent)] border border-[var(--accent-soft-border)]",
        className
      )}
      title={`Уровень ${level}`}
    >
      {level}
    </span>
  )
}
