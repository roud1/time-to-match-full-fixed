"use client"

import { CountdownTimer } from "@/components/ui/countdown-timer"
import { FreezeButton } from "@/components/matches/freeze-button"
import { OnboardingHint } from "@/components/ui/onboarding-hint"
import { useChatMatchExpiry } from "@/hooks/use-chat-match-expiry"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ChatMatchExpiryBarProps = {
  profileId: number
  className?: string
  compact?: boolean
}

export function ChatMatchExpiryBar({ profileId, className, compact }: ChatMatchExpiryBarProps) {
  const { t } = useI18n()
  const expiry = useChatMatchExpiry(profileId)

  if (!expiry) return null

  return (
    <div className={cn("flex flex-col items-end gap-1 shrink min-w-0", className)}>
      <div
        className={cn(
          "ttm-match-expiry-bar flex items-center gap-1.5 rounded-xl px-2 py-1 min-w-0"
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
          onExpire={expiry.refresh}
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
      <OnboardingHint
        hintId="chatMatchTimer"
        message={t("onboardingChatMatchTimer")}
        className="w-[min(92vw,16rem)]"
      />
    </div>
  )
}
