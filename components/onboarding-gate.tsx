"use client"

import { useEffect, useState, type ReactNode } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"

const STORAGE_KEY = "ttm-onboarding-done"

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [show, setShow] = useState<boolean | null>(null)

  useEffect(() => {
    setShow(!localStorage.getItem(STORAGE_KEY))
  }, [])

  const complete = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setShow(false)
  }

  if (show === null) return null
  if (show) {
    return <OnboardingFlow onComplete={complete} className="w-full" />
  }
  return <>{children}</>
}
