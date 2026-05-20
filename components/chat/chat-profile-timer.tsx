"use client"

import { useSwipeProfileCountdown } from "@/lib/swipe-profile-timer"
import { cn } from "@/lib/utils"

export function ChatProfileTimer({
  profileId,
  initialTimeLeft,
  className,
}: {
  profileId: number
  initialTimeLeft: string
  className?: string
}) {
  const timeLeft = useSwipeProfileCountdown(profileId, initialTimeLeft, true)

  return (
    <span className={cn("tabular-nums font-light", className)}>{timeLeft}</span>
  )
}
