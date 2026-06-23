"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { PremiumUpgradeHint } from "@/client/lib/premium-upgrade-hints"

type PremiumUpgradeContextValue = {
  openUpgrade: (hint?: PremiumUpgradeHint) => void
  closeUpgrade: () => void
  sheetOpen: boolean
  hint: PremiumUpgradeHint | null
  profileVersion: number
}

const PremiumUpgradeContext = createContext<PremiumUpgradeContextValue | null>(null)

export function PremiumUpgradeProvider({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [hint, setHint] = useState<PremiumUpgradeHint | null>(null)
  const [profileVersion, setProfileVersion] = useState(0)

  useEffect(() => {
    const bump = () => setProfileVersion((v) => v + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    return () => window.removeEventListener("ttm-user-profile-changed", bump)
  }, [])

  const openUpgrade = useCallback((h?: PremiumUpgradeHint) => {
    setHint(h ?? "default")
    setSheetOpen(true)
  }, [])

  const closeUpgrade = useCallback(() => setSheetOpen(false), [])

  const value = useMemo(
    () => ({
      openUpgrade,
      closeUpgrade,
      sheetOpen,
      hint,
      profileVersion,
    }),
    [openUpgrade, closeUpgrade, sheetOpen, hint, profileVersion]
  )

  return <PremiumUpgradeContext.Provider value={value}>{children}</PremiumUpgradeContext.Provider>
}

export function usePremiumUpgrade() {
  const ctx = useContext(PremiumUpgradeContext)
  if (!ctx) throw new Error("usePremiumUpgrade must be used within PremiumUpgradeProvider")
  return ctx
}

export function usePremiumUpgradeOptional() {
  return useContext(PremiumUpgradeContext)
}
