"use client"

import { cn } from "@/client/lib/utils"

type NotifyBadgeProps = {
  count: number
  className?: string
  max?: number
}

/** Compact unread counter — dock tabs & activity bell. */
export function NotifyBadge({ count, className, max = 9 }: NotifyBadgeProps) {
  if (count <= 0) return null

  const label = count > max ? `${max}+` : String(count)

  return (
    <span className={cn("ttm-notify-badge", className)} aria-hidden>
      {label}
    </span>
  )
}
