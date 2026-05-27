"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { getDiscoverDeckProfiles } from "@/lib/discover-deck"
import { fetchDiscoverProfiles } from "@/lib/discover/api"
import { discoverProfileToSwipe } from "@/lib/discover/map-profile"
import type { DiscoverFilters } from "@/lib/discover/types"
import { loadDiscoverFilters, saveDiscoverFilters } from "@/lib/discover/filters-storage"
import { SwipeDeck } from "@/components/app/swipe-deck"
import { DiscoverAmbient } from "@/components/discover/discover-ambient"
import { DiscoverTimeLimitsBanner } from "@/components/discover/discover-time-limits-banner"
import { DiscoverFiltersModal } from "@/components/discover/discover-filters-modal"
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
  onOpenFilters,
}: {
  premium: boolean
  onBoost: () => void
  onOpenFilters: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="ttm-discover-strip shrink-0 w-full text-left pb-2 sm:pb-3 border-b mb-2 sm:mb-3">
      <div className="flex items-center justify-between gap-2 min-h-[1.75rem]">
        <h1 className="ttm-discover-title text-base sm:text-lg font-medium tracking-tight truncate min-w-0">
          {t("tabDiscover")}
        </h1>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] touch-manipulation"
            aria-label={t("discoverFiltersOpen")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 4h18M7 8h10M11 12h2M13 16h-2"
              />
            </svg>
          </button>
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
      </div>
      <p className="ttm-discover-subtitle mt-1 text-[10px] sm:text-[11px] font-extralight leading-snug line-clamp-2">
        {t("discoverPanelSubtitle")}
      </p>
      <p className="ttm-discover-subtitle mt-0.5 text-[9px] sm:text-[10px] font-extralight leading-snug line-clamp-1 opacity-80">
        {t("discoverPanelHint")}
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
  const [filters, setFilters] = useState<DiscoverFilters>(() => loadDiscoverFilters())
  const [filtersOpen, setFiltersOpen] = useState(false)

  const loadDeck = useCallback(async () => {
    let deck = getDiscoverDeckProfiles(locale, location.position, filters)
    try {
      const fromApi = await fetchDiscoverProfiles(filters, location.position)
      if (fromApi.length > 0) {
        const apiCards = fromApi.map((c) => discoverProfileToSwipe(c, locale))
        const apiIds = new Set(apiCards.map((c) => c.id))
        deck = [...apiCards, ...deck.filter((p) => !apiIds.has(p.id))]
      }
    } catch {
      /* demo deck only */
    }
    return deck
  }, [locale, location.position, trustV, profileTick, filters])

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
    let cancelled = false
    void loadDeck().then((deck) => {
      if (!cancelled) {
        setProfiles(deck)
        setDeckBooted(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, loadDeck])

  const handleProfilesChange = useCallback(
    (next: SwipeProfile[]) => {
      if (next.length === 0) {
        void loadDeck().then(setProfiles)
        return
      }
      setProfiles(next)
    },
    [loadDeck]
  )

  useEffect(() => {
    if (!hydrated || !deckBooted) return
    const refillIfEmpty = () => {
      if (profiles.length > 0) return
      void loadDeck().then(setProfiles)
    }
    window.addEventListener("ttm-social-updated", refillIfEmpty)
    return () => window.removeEventListener("ttm-social-updated", refillIfEmpty)
  }, [hydrated, deckBooted, loadDeck, profiles.length])

  const handleRevive = () => {
    reviveProfilePresence()
    setProfileTick((x) => x + 1)
  }

  const deck = (
    <div className="relative z-[1] grid grid-cols-[1fr_auto_1fr] flex-1 min-h-0 w-full items-center overflow-hidden">
      <SwipeDeck booted={deckBooted} profiles={profiles} onProfilesChange={handleProfilesChange} centered />
    </div>
  )

  return (
    <div className="discover-panel-root flex flex-col h-full min-h-0 overflow-hidden pt-2">
      <DiscoverAmbient />
      <DiscoverContextStrip
        premium={premium}
        onBoost={() => openUpgrade("boost")}
        onOpenFilters={() => setFiltersOpen(true)}
      />
      <DiscoverTimeLimitsBanner className="relative z-[1] shrink-0 mb-2 sm:mb-3" />
      <DiscoverFiltersModal
        open={filtersOpen}
        filters={filters}
        hasLocation={location.position != null}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next)
          saveDiscoverFilters(next)
        }}
      />
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
