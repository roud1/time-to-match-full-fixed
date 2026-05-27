"use client"

import { useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { formatTimerHoursCeil, parseTimeLeftToMs } from "@/lib/profile-timer-mood"
import { useSwipeProfileCountdown } from "@/lib/swipe-profile-timer"
import { cn } from "@/lib/utils"

type SwipeProfileExpiryChipProps = {
  profileId: number
  timeLeft: string
  live?: boolean
  className?: string
}

/** Compact profile TTL on swipe cards (hours left). */
export function SwipeProfileExpiryChip({
  profileId,
  timeLeft,
  live = false,
  className,
}: SwipeProfileExpiryChipProps) {
  const { t } = useI18n()
  const display = useSwipeProfileCountdown(profileId, timeLeft, live && profileId > 0)
  const ms = useMemo(() => parseTimeLeftToMs(display), [display])
  const hours = formatTimerHoursCeil(ms)
  const urgent = ms > 0 && ms < 6 * 60 * 60 * 1000

  if (ms <= 0) return null

  return (
    <span
      className={cn(
        "ttm-swipe-expiry-chip",
        urgent && "ttm-swipe-expiry-chip--urgent",
        className
      )}
      title={t("profileExpiresIn")}
    >
      <span aria-hidden>⏳</span>
      <span className="tabular-nums">{t("discoverExpiryHoursShort").replace("{hours}", String(hours))}</span>
    </span>
  )
}
