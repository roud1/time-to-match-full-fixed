"use client"

import { useCallback, useRef } from "react"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { FreezeButton } from "@/components/matches/freeze-button"
import { OnboardingHint } from "@/components/ui/onboarding-hint"
import { useChatMatchExpiry } from "@/hooks/use-chat-match-expiry"
import { useI18n } from "@/lib/i18n"
import { trackMatchExpiredOnce } from "@/lib/analytics-funnel"
import { cn } from "@/lib/utils"

type ChatMatchExpiryBarProps = {
  profileId: number
  className?: string
  compact?: boolean
  /** Inline in chat header toolbar — no onboarding hint below */
  variant?: "default" | "header"
}

export function ChatMatchExpiryBar({
  profileId,
  className,
  compact,
  variant = "default",
}: ChatMatchExpiryBarProps) {
  const { t } = useI18n()
  const expiry = useChatMatchExpiry(profileId)
  const expiredTracked = useRef(false)

  const handleExpire = useCallback(() => {
    expiry?.refresh()
    if (!expiredTracked.current && expiry?.matchId) {
      expiredTracked.current = true
      trackMatchExpiredOnce(expiry.matchId)
    }
  }, [expiry])

  if (!expiry) return null

  const bar = (
    <div
      className={cn(
        "ttm-match-expiry-bar flex items-center gap-1.5 min-w-0",
        variant === "header" ? "ttm-match-expiry-bar--header h-full px-2.5 py-1.5" : "rounded-xl px-2 py-1"
      )}
    >
      <span
        className={cn(
          "ttm-match-expiry-label font-extralight uppercase tracking-wider shrink-0",
          compact ? "text-[8px]" : "text-[9px]"
        )}
      >
        {t("matchExpiryLabel")}
      </span>
      <CountdownTimer
        expiresAt={expiry.expiresAt}
        compact={compact}
        flashKey={expiry.flashKey}
        onExpire={handleExpire}
        context="match"
      />
      <FreezeButton
        matchId={expiry.matchId}
        profileId={profileId}
        isFrozen={expiry.isFrozen}
        expiresAt={expiry.expiresAt}
        onFreezeSuccess={expiry.applyFreeze}
        compact={compact}
      />
    </div>
  )

  if (variant === "header") {
    return <div className={cn("ttm-match-expiry-wrap min-w-0 flex-1", className)}>{bar}</div>
  }

  return (
    <div className={cn("flex flex-col items-end gap-1 shrink min-w-0", className)}>
      {bar}
      <OnboardingHint
        hintId="chatMatchTimer"
        message={t("onboardingChatMatchTimer")}
        className="w-[min(92vw,16rem)]"
      />
    </div>
  )
}
