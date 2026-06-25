"use client"

import { Clock } from "lucide-react"
import { cn } from "@/client/lib/utils"

type DatingTimerBadgeProps = {
  value: string
  label?: string
  urgent?: boolean
  className?: string
}

/** Compact 24h countdown pill for match / swipe surfaces */
export function DatingTimerBadge({ value, label, urgent, className }: DatingTimerBadgeProps) {
  return (
    <span
      className={cn("ttm-dating-timer-badge", urgent && "ttm-dating-timer-badge--urgent", className)}
      role="timer"
    >
      <Clock className="ttm-dating-timer-badge__icon" size={14} aria-hidden />
      <span className="tabular-nums">{value}</span>
      {label ? <span className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-80">{label}</span> : null}
    </span>
  )
}
