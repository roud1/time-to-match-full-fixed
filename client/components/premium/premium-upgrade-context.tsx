"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { PremiumUpgradeHint } from "@/client/lib/premium-upgrade-hints"

type PremiumUpgradeContextValue = {
  openUpgrade: (hint?: PremiumUpgradeHint) => void
  openPaywall: (hint?: PremiumUpgradeHint) => void
  closeUpgrade: () => void
  closePaywall: () => void
  sheetOpen: boolean
  modalOpen: boolean
  hint: PremiumUpgradeHint | null
  profileVersion: number
}

const PremiumUpgradeContext = createContext<PremiumUpgradeContextValue | null>(null)

export function PremiumUpgradeProvider({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [hint, setHint] = useState<PremiumUpgradeHint | null>(null)
  const [profileVersion, setProfileVersion] = useState(0)

  useEffect(() => {
    const bump = () => setProfileVersion((v) => v + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    return () => window.removeEventListener("ttm-user-profile-changed", bump)
  }, [])

  const openPaywall = useCallback((h?: PremiumUpgradeHint) => {
    setHint(h ?? "likes")
    setModalOpen(true)
    setSheetOpen(false)
  }, [])

  const closePaywall = useCallback(() => setModalOpen(false), [])

  const openUpgrade = useCallback((h?: PremiumUpgradeHint) => {
    const next = h ?? "default"
    setHint(next)
    if (next === "likes" || next === "likedYou") {
      setModalOpen(true)
      setSheetOpen(false)
    } else {
      setSheetOpen(true)
      setModalOpen(false)
    }
  }, [])

  const closeUpgrade = useCallback(() => setSheetOpen(false), [])

  const value = useMemo(
    () => ({
      openUpgrade,
      openPaywall,
      closeUpgrade,
      closePaywall,
      sheetOpen,
      modalOpen,
      hint,
      profileVersion,
    }),
    [openUpgrade, openPaywall, closeUpgrade, closePaywall, sheetOpen, modalOpen, hint, profileVersion]
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
