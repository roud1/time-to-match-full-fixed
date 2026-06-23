"use client"

import { useEffect, useState, type ReactNode } from "react"
import { OnboardingFlow } from "@/client/components/onboarding-flow"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { useI18n } from "@/client/lib/i18n"
import { CinematicCard } from "@/client/components/ui/cinematic-card"

const STORAGE_KEY = "ttm-onboarding-done"

export function WelcomeOnboardingShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const { t } = useI18n()
  const [showSlides, setShowSlides] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    setShowSlides(!localStorage.getItem(STORAGE_KEY))
  }, [hydrated])

  const completeSlides = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setShowSlides(false)
  }

  if (!hydrated) {
    return (
      <div className="ttm-brand-glass rounded-3xl p-8 w-full text-center">
        <p className="ttm-type-muted">{t("locationLoading")}</p>
      </div>
    )
  }

  if (showSlides) {
    return (
      <CinematicCard variant="glass" className="ttm-brand-glass w-full border border-white/10">
        <OnboardingFlow onComplete={completeSlides} />
      </CinematicCard>
    )
  }

  return <>{children}</>
}
