"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { CountdownTimer } from "@/client/components/ui/countdown-timer"
import { EmptyState } from "@/client/components/ui/empty-state"
import { OnboardingHint } from "@/client/components/ui/onboarding-hint"
import { PremiumButton } from "@/client/components/ui/premium-button"
import { useI18n } from "@/client/lib/i18n"
import { useUser } from "@/client/hooks/use-user"
import { recordProfileActivity } from "@/client/lib/profile-life-store"
import { getProfileTimeLeft, getUserProfile, type StoredUserProfile } from "@/client/lib/user-profile"
import { cn } from "@/client/lib/utils"

type ProfileExpiryPanelProps = {
  profile: StoredUserProfile
  onProfileUpdate: (next: StoredUserProfile) => void
  className?: string
}

/**
 * Time left in the feed. The server is the source of truth (users.profile_expires_at, 72 h, renewed for free by any
 * activity — server/profile-life/service.ts). The old paid "+24 h" card was a client-only simulation and is gone.
 */
export function ProfileExpiryPanel({ profile, onProfileUpdate, className }: ProfileExpiryPanelProps) {
  const { t } = useI18n()
  const { user: meUser, refetch } = useUser()
  const serverEndsAt = meUser?.profileExpiresAt ?? null
  const [now, setNow] = useState(() => Date.now())
  const endsAtIso = serverEndsAt ?? new Date(getProfileTimeLeft(profile).endsAt).toISOString()

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const expired = new Date(endsAtIso).getTime() <= now

  if (expired) {
    return (
      <div className={cn("space-y-4 mb-5", className)}>
        <EmptyState
          icon={Clock}
          title={t("profileExpiredEmptyTitle")}
          description={t("lvExpiredBody")}
          action={
            <PremiumButton
              type="button"
              className="min-h-[44px] px-6"
              onClick={() => {
                recordProfileActivity()
                window.setTimeout(() => void refetch(), 800)
                const updated = getUserProfile()
                if (updated) onProfileUpdate(updated)
              }}
            >
              {t("lvRevive")}
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
    </div>
  )
}
