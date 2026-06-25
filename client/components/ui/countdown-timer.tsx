"use client"

import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { localeToBcp47 } from "@/client/lib/i18n/config"
import {
  formatExpiryAriaTime,
  formatExpiryCountdown,
  getTimerUrgency,
} from "@/client/lib/expiry"
import { cn } from "@/client/lib/utils"

type CountdownTimerProps = {
  expiresAt: string
  className?: string
  compact?: boolean
  /** Increment to replay the success flash animation. */
  flashKey?: number
  onExpire?: () => void
  context?: "match" | "profile"
}

export function CountdownTimer({
  expiresAt,
  className,
  compact,
  flashKey = 0,
  onExpire,
  context = "match",
}: CountdownTimerProps) {
  const { t, locale } = useI18n()
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  )
  const [tickPulse, setTickPulse] = useState(0)
  const prevDisplay = useRef(formatExpiryCountdown(remainingMs))

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      setRemainingMs(next)
      const display = formatExpiryCountdown(next)
      if (display !== prevDisplay.current) {
        prevDisplay.current = display
        setTickPulse((n) => n + 1)
      }
      if (next === 0) onExpire?.()
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  const urgency = getTimerUrgency(remainingMs)
  const display = formatExpiryCountdown(remainingMs)
  const urgencyLabel =
    urgency === "critical"
      ? t("timeRunningOutCritical")
      : urgency === "warning"
        ? t("timeRunningOutWarning")
        : null
  const ariaTime = formatExpiryAriaTime(remainingMs)
  const ariaLabel =
    context === "profile"
      ? t("countdownAriaProfile").replace("{time}", ariaTime)
      : t("countdownAriaMatch").replace("{time}", ariaTime)

  const expiresDate = new Date(expiresAt)
  const dateLocale = localeToBcp47(locale)
  const tooltipDate = expiresDate.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
  })
  const tooltipTime = expiresDate.toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  })
  const tooltip = t("countdownTooltip")
    .replace("{date}", tooltipDate)
    .replace("{time}", tooltipTime)

  return (
    <span
      title={tooltip}
      className={cn(
        "ttm-countdown-timer inline-flex items-center gap-1 tabular-nums font-light",
        compact ? "text-[10px]" : "text-xs",
        urgency === "critical" && "ttm-countdown-timer--critical",
        urgency === "warning" && "ttm-countdown-timer--warning",
        urgency === "normal" && "ttm-countdown-timer--normal",
        flashKey > 0 && "ttm-countdown-timer--flash",
        className
      )}
      data-urgency={urgency}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={urgencyLabel ? `${urgencyLabel}. ${ariaLabel}` : ariaLabel}
    >
      {urgencyLabel ? (
        <span className="ttm-countdown-timer__urgency hidden sm:inline text-[9px] uppercase tracking-wider opacity-90">
          {urgencyLabel}
        </span>
      ) : null}
      <span
        key={`${tickPulse}-${flashKey}`}
        className="ttm-countdown-timer__digits inline-block"
      >
        {display}
      </span>
    </span>
  )
}
