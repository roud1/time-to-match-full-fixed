"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { enableDemoSwipeDeck } from "@/lib/demo-profiles"
import { PROFILE_READY_STRENGTH } from "@/lib/profile-completion-hints"
import { computeProfileStrength } from "@/lib/profile-completion"
import { strengthHintKey } from "@/components/profile/profile-strength-utils"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { isWelcomeSeen, markWelcomeSeen } from "@/lib/welcome-seen"
import { ProfilePresenceCard } from "@/components/profile/profile-presence-card"
import { WelcomeMatchTimer } from "@/components/welcome/welcome-match-timer"
import { WelcomeCompletionChecklist } from "@/components/welcome/welcome-completion-checklist"
import { WelcomeTips } from "@/components/welcome/welcome-tips"
import { WelcomeProgressSteps } from "@/components/welcome/welcome-progress-steps"
import { WelcomeOnboardingShell } from "@/components/welcome/welcome-onboarding-shell"
function WelcomePitch({ className, name }: { className?: string; name: string }) {
  const { t } = useI18n()
  const chips = [t("welcomeChipMatch24"), t("profileChipSync"), t("profileChipStrength")]

  return (
    <div className={className}>
      <p className="ttm-welcome-page__eyebrow">{t("welcomeRitualEyebrow")}</p>
      <h1 className="ttm-welcome-page__title">
        {t("welcomeTitle")}, <em>{name}</em>
      </h1>
      <p className="ttm-welcome-page__lead">{t("welcomeSubtitle")}</p>
      <ul className="ttm-welcome-page__chips" aria-label={t("profileBandChipsAria")}>
        {chips.map((chip) => (
          <li key={chip} className="ttm-welcome-page__chip">
            {chip}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WelcomeActions({ strength }: { strength: number }) {
  const { t } = useI18n()
  const ready = strength >= PROFILE_READY_STRENGTH
  const primaryHref = ready ? "/app" : "/profile?edit=1"
  const primaryLabel = ready ? t("welcomeCta") : t("welcomeCtaCompleteProfile")

  const handlePrimary = () => {
    markWelcomeSeen()
  }

  return (
    <div className="ttm-welcome-page__actions">
      <Link
        href={primaryHref}
        onClick={handlePrimary}
        className="ttm-brand-cta w-full inline-flex items-center justify-center rounded-2xl font-extralight touch-manipulation"
      >
        {primaryLabel}
      </Link>
      {ready ? (
        <Link
          href="/profile?edit=1"
          onClick={markWelcomeSeen}
          className="ttm-welcome-page__edit-link"
        >
          {t("welcomeEditProfile")}
        </Link>
      ) : (
        <Link href="/app" onClick={markWelcomeSeen} className="ttm-welcome-page__edit-link">
          {t("welcomeSkipToApp")}
        </Link>
      )}
    </div>
  )
}

export function WelcomeScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile>>(null)

  const forceStay = searchParams.get("stay") === "1" || Boolean(searchParams.get("invite"))

  useEffect(() => {
    const stored = getUserProfile()
    if (!stored) {
      router.replace("/register")
      return
    }
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    if (!forceStay && isWelcomeSeen()) {
      router.replace("/app")
      return
    }
    setProfile(stored)
    enableDemoSwipeDeck()
  }, [router, forceStay])

  if (!profile) {
    return (
      <div className="ttm-brand-glass rounded-3xl p-8 w-full text-center">
        <p className="ttm-type-muted">{t("locationLoading")}</p>
      </div>
    )
  }

  const strength = computeProfileStrength(profile)
  const hintKey = strengthHintKey(strength)
  const displayName = profile.name.split(/\s+/)[0] || profile.name

  return (
    <WelcomeOnboardingShell>
      <div className="ttm-welcome-page">
        <WelcomePitch className="ttm-welcome-page__pitch--mobile" name={displayName} />

        <WelcomeProgressSteps strength={strength} className="ttm-welcome-page__progress mb-6" />

        <div className="ttm-welcome-page__grid">
        <aside className="ttm-welcome-page__aside">
          <WelcomePitch className="ttm-welcome-page__pitch--desktop" name={displayName} />
          <WelcomeMatchTimer />
          <WelcomeCompletionChecklist profile={profile} />
          <WelcomeTips />
          <div className="ttm-welcome-page__footer--aside">
            <WelcomeActions strength={strength} />
          </div>
        </aside>

        <div className="ttm-welcome-page__card">
          <ProfilePresenceCard
            layout="wide"
            profile={profile}
            strength={strength}
            strengthHint={t(hintKey)}
            strengthEditHref="/profile?edit=1"
          />
        </div>
      </div>

      <div className="ttm-welcome-page__footer--mobile">
        <WelcomeMatchTimer />
        <WelcomeCompletionChecklist profile={profile} />
        <WelcomeTips />
        <WelcomeActions strength={strength} />
      </div>
    </div>
    </WelcomeOnboardingShell>
  )
}
