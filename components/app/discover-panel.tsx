"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { getDiscoverDeckProfiles } from "@/lib/discover-deck"
import { SwipeDeck } from "@/components/app/swipe-deck"
import { useTrustSafetyVersion } from "@/hooks/use-trust-safety-version"
import { useHydrated } from "@/hooks/use-hydrated"
import { getUserProfile, isPremiumActive } from "@/lib/user-profile"
import { usePremiumUpgrade } from "@/components/premium/premium-upgrade-context"
import { ProfileLifeDiscoverGate } from "@/components/profile/profile-life-presence"
import { useProfileLife } from "@/hooks/use-profile-life"
import { reviveProfilePresence } from "@/lib/profile-life-store"

/** Compact copy strip — lives under the app header, not beside the card. */
function DiscoverContextStrip({
  premium,
  onBoost,
}: {
  premium: boolean
  onBoost: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="shrink-0 w-full text-left pb-2 sm:pb-3 border-b border-white/[0.06] mb-2 sm:mb-3">
      <div className="flex items-center justify-between gap-2 min-h-[1.75rem]">
        <h1 className="text-base sm:text-lg font-extralight tracking-tight bg-gradient-to-r from-white via-pink-100 to-purple-200 bg-clip-text text-transparent truncate">
          {t("tabDiscover")}
        </h1>
        {premium ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-light text-amber-100/95 ttm-premium-badge-glow">
            <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" aria-hidden />
            {t("premiumBoostActive")}
          </span>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onBoost}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-light text-amber-100/90 touch-manipulation"
          >
            <svg className="w-2.5 h-2.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
            </svg>
            {t("premiumBoostChip")}
          </motion.button>
        )}
      </div>
      <p className="mt-1 text-[10px] sm:text-[11px] text-muted-foreground font-light leading-snug line-clamp-1">
        {t("swipeSubtitle")}
      </p>
      <p className="mt-0.5 text-[9px] sm:text-[10px] text-pink-100/75 font-light leading-snug line-clamp-1">
        {t("swipeUrgencyStrip")}
      </p>
    </div>
  )
}

export function DiscoverPanel() {
  const { locale, location } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const trustV = useTrustSafetyVersion()
  const hydrated = useHydrated()
  const [profiles, setProfiles] = useState<SwipeProfile[]>([])
  const [deckBooted, setDeckBooted] = useState(false)
  const [profileTick, setProfileTick] = useState(0)

  const loadDeck = useCallback(
    () => getDiscoverDeckProfiles(locale, location.position),
    [locale, location.position, trustV, profileTick]
  )

  useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    return () => window.removeEventListener("ttm-user-profile-changed", bump)
  }, [])

  const user = getUserProfile()
  const premium = Boolean(user && isPremiumActive(user))
  const profileLife = useProfileLife()

  useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1)
    window.addEventListener("ttm-profile-life-updated", bump)
    return () => window.removeEventListener("ttm-profile-life-updated", bump)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const deck = loadDeck()
    setProfiles(deck)
    setDeckBooted(true)
  }, [hydrated, loadDeck])

  const handleProfilesChange = useCallback(
    (next: SwipeProfile[]) => {
      if (next.length === 0) {
        setProfiles(loadDeck())
        return
      }
      setProfiles(next)
    },
    [loadDeck]
  )

  useEffect(() => {
    if (!hydrated || !deckBooted) return
    const refillIfEmpty = () => {
      setProfiles((prev) => (prev.length > 0 ? prev : loadDeck()))
    }
    window.addEventListener("ttm-social-updated", refillIfEmpty)
    return () => window.removeEventListener("ttm-social-updated", refillIfEmpty)
  }, [hydrated, deckBooted, loadDeck])

  const handleRevive = () => {
    reviveProfilePresence()
    setProfileTick((x) => x + 1)
  }

  const deck = (
    <div className="grid grid-cols-[1fr_auto_1fr] flex-1 min-h-0 w-full items-center overflow-hidden">
      <SwipeDeck booted={deckBooted} profiles={profiles} onProfilesChange={handleProfilesChange} centered />
    </div>
  )

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden pt-2">
      <DiscoverContextStrip premium={premium} onBoost={() => openUpgrade("boost")} />
      {profileLife ? (
        <ProfileLifeDiscoverGate life={profileLife} onRevive={handleRevive}>
          {deck}
        </ProfileLifeDiscoverGate>
      ) : (
        deck
      )}
    </div>
  )
}
