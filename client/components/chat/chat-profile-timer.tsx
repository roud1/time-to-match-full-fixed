"use client"

import { useSwipeProfileCountdown } from "@/client/lib/swipe-profile-timer"
import { cn } from "@/client/lib/utils"

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
