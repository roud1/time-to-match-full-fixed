"use client"

import { useEffect, useState, type ReactNode } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { useHydrated } from "@/hooks/use-hydrated"
import { useI18n } from "@/lib/i18n"

const STORAGE_KEY = "ttm-onboarding-done"

export function OnboardingGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const { t } = useI18n()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    setShowOnboarding(!localStorage.getItem(STORAGE_KEY))
  }, [hydrated])

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setShowOnboarding(false)
  }

  if (!hydrated) {
    return (
      <div
        className="w-full max-w-lg mx-auto flex items-center justify-center min-h-[280px] px-6"
        aria-busy
      >
        <p className="text-sm font-extralight text-white/40">{t("locationLoading")}</p>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={complete} className="w-full" />
  }

  return <>{children}</>
}
