"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { EmptyState } from "@/components/ui/empty-state"
import { OnboardingHint } from "@/components/ui/onboarding-hint"
import { PremiumButton } from "@/components/ui/premium-button"
import { ProfileExtensionCard } from "@/components/profile/profile-extension-card"
import { useI18n } from "@/lib/i18n"
import {
  extendProfile24Hours,
  getProfileTimeLeft,
  getUserProfile,
  isProfileExpired,
  type StoredUserProfile,
} from "@/lib/user-profile"
import { cn } from "@/lib/utils"

type ProfileExpiryPanelProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
  className?: string
}

export function ProfileExpiryPanel({
  profile,
  onProfileUpdate,
  className,
}: ProfileExpiryPanelProps) {
  const { t } = useI18n()
  const [endsAtIso, setEndsAtIso] = useState(() =>
    new Date(getProfileTimeLeft(profile).endsAt).toISOString()
  )

  useEffect(() => {
    const sync = () => {
      const p = profile
      setEndsAtIso(new Date(getProfileTimeLeft(p).endsAt).toISOString())
    }
    sync()
    const id = window.setInterval(sync, 1000)
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => {
      clearInterval(id)
      window.removeEventListener("ttm-user-profile-changed", sync)
    }
  }, [profile])

  const expired = isProfileExpired(profile)

  if (expired) {
    return (
      <div className={cn("space-y-4 mb-5", className)}>
        <EmptyState
          icon={Clock}
          title={t("profileExpiredEmptyTitle")}
          description={t("profileExpiredEmptyBody")}
          action={
            <PremiumButton
              type="button"
              className="min-h-[44px] px-6"
              onClick={() => {
                extendProfile24Hours()
                const updated = getUserProfile()
                if (updated) onProfileUpdate(updated)
              }}
            >
              {t("profileExpiredEmptyCta")}
            </PremiumButton>
          }
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-3 mb-5", className)}>
      <div className="ttm-accent-plaque flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5">
        <Clock className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden />
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extralight">
          {t("profileExpiryLabel")}
        </span>
        <CountdownTimer expiresAt={endsAtIso} context="profile" compact />
      </div>
      <OnboardingHint hintId="profileExpiry" message={t("onboardingProfileExpiry")} />
      <ProfileExtensionCard profile={profile} onProfileUpdate={onProfileUpdate} expired={false} />
    </div>
  )
}
