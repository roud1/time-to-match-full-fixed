"use client"

import { useMemo } from "react"
import { useI18n } from "@/client/lib/i18n"
import {
  formatTimerHoursCeil,
  getTimerMoodBadgeClass,
  getTimerMoodFromMs,
  getTimerMoodKey,
  parseTimeLeftToMs,
} from "@/client/lib/profile-timer-mood"
import { useSwipeProfileCountdown } from "@/client/lib/swipe-profile-timer"
import { cn } from "@/client/lib/utils"

type ProfileTimerMoodProps = {
  profileId?: number
  timeLeft: string
  live?: boolean
  className?: string
  size?: "sm" | "md"
}

export function ProfileTimerMood({
  profileId = 0,
  timeLeft,
  live = false,
  className,
  size = "md",
}: ProfileTimerMoodProps) {
  const { t } = useI18n()
  const display = useSwipeProfileCountdown(profileId, timeLeft, live && profileId > 0)

  const ms = useMemo(() => parseTimeLeftToMs(display), [display])
  const mood = getTimerMoodFromMs(ms)
  const key = getTimerMoodKey(mood)
  const hours = formatTimerHoursCeil(ms)

  const label = t(key).replace("{hours}", String(hours))

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md font-light tracking-wide",
        getTimerMoodBadgeClass(mood),
        size === "sm" ? "text-[9px]" : "text-[10px]",
        className
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5",
          mood === "critical" || mood === "almostGone"
            ? "bg-white/80"
            : "bg-white/40"
        )}
        aria-hidden
      />
      {label}
    </span>
  )
}
