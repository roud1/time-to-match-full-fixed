"use client"

import { cn } from "@/lib/utils"

type LevelXpBarProps = {
  level: number
  xpInLevel: number
  xpForNextLevel: number
  progress: number
  className?: string
  compact?: boolean
}

export function LevelXpBar({
  level,
  xpInLevel,
  xpForNextLevel,
  progress,
  className,
  compact,
}: LevelXpBarProps) {
  const pct = Math.round(Math.min(100, Math.max(0, progress * 100)))

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-[var(--text-primary)]">
          Уровень {level}
        </span>
        {!compact && (
          <span className="text-xs text-[var(--text-secondary)] tabular-nums">
            {xpInLevel} / {xpForNextLevel} XP
          </span>
        )}
      </div>
      <div
        className="h-[6px] w-full rounded-full overflow-hidden bg-[var(--border)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--accent-gradient)] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  )
}
