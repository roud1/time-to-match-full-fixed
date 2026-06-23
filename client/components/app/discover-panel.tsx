"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { getDiscoverDeckProfiles, isDiscoverFilteredEmpty } from "@/client/lib/discover-deck"
import { getAppMode } from "@/client/lib/auth/client"
import { fetchDiscoverProfiles } from "@/client/lib/discover/api"
import {
  hasDiscoverViewerPosition,
  resolveDiscoverViewerPosition,
} from "@/client/lib/discover/viewer-position"
import { discoverProfileToSwipe } from "@/client/lib/discover/map-profile"
import type { DiscoverFilters } from "@/client/lib/discover/types"
import { loadDiscoverFilters, saveDiscoverFilters } from "@/client/lib/discover/filters-storage"
import { SwipeDeck } from "@/client/components/app/swipe-deck"
import { DiscoverAmbient } from "@/client/components/discover/discover-ambient"
import { DiscoverToolbar } from "@/client/components/discover/discover-toolbar"
import { DiscoverFiltersModal } from "@/client/components/discover/discover-filters-modal"
import { DiscoverAside } from "@/client/components/discover/discover-aside"
import { DiscoverPitch } from "@/client/components/discover/discover-pitch"
import { WelcomeTips } from "@/client/components/welcome/welcome-tips"
import { WelcomeMatchTimer } from "@/client/components/welcome/welcome-match-timer"
import { useTrustSafetyVersion } from "@/client/hooks/use-trust-safety-version"
import { useHydrated } from "@/client/hooks/use-hydrated"
import { getUserProfile, isPremiumActive } from "@/client/lib/user-profile"
import { usePremiumUpgrade } from "@/client/components/premium/premium-upgrade-context"
import { ProfileLifeDiscoverGate } from "@/client/components/profile/profile-life-presence"
import { useProfileLife } from "@/client/hooks/use-profile-life"
import { reviveProfilePresence } from "@/client/lib/profile-life-store"
export function DiscoverPanel() {
  const { t, locale, location } = useI18n()
  const { openUpgrade } = usePremiumUpgrade()
  const trustV = useTrustSafetyVersion()
  const hydrated = useHydrated()
  const [profiles, setProfiles] = useState<SwipeProfile[]>([])
  const [deckBooted, setDeckBooted] = useState(false)
  const [profileTick, setProfileTick] = useState(0)
  const [filters, setFilters] = useState<DiscoverFilters>(() => loadDiscoverFilters())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [deckEmptyReason, setDeckEmptyReason] = useState<"swiped" | "filters" | null>(null)
  const [deckRefreshing, setDeckRefreshing] = useState(false)

  const loadDeck = useCallback(
    async (activeFilters: DiscoverFilters = filters) => {
      const viewerPosition = resolveDiscoverViewerPosition(location.position)
      const filteredEmpty = isDiscoverFilteredEmpty(locale, viewerPosition, activeFilters)
      const mode = await getAppMode()

      let deck: SwipeProfile[] = []
      if (mode === "production") {
        const fromApi = await fetchDiscoverProfiles(activeFilters, viewerPosition)
        deck = fromApi.map((c) => discoverProfileToSwipe(c, locale))
      } else {
        deck = getDiscoverDeckProfiles(locale, viewerPosition, activeFilters)
        try {
          const fromApi = await fetchDiscoverProfiles(activeFilters, viewerPosition)
          if (fromApi.length > 0) {
            const apiCards = fromApi.map((c) => discoverProfileToSwipe(c, locale))
            const apiIds = new Set(apiCards.map((c) => c.id))
            deck = [...apiCards, ...deck.filter((p) => !apiIds.has(p.id))]
          }
        } catch {
          /* demo deck only */
        }
      }

      setDeckEmptyReason(
        deck.length === 0 ? (filteredEmpty ? "filters" : "swiped") : null
      )
      return deck
    },
    [locale, location.position, trustV, profileTick, filters]
  )

  const reloadDeck = useCallback(
    async (activeFilters: DiscoverFilters = filters) => {
      setDeckRefreshing(true)
      try {
        const deck = await loadDeck(activeFilters)
        setProfiles(deck)
        setDeckBooted(true)
      } finally {
        setDeckRefreshing(false)
      }
    },
    [filters, loadDeck]
  )

  useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    window.addEventListener("ttm-location-settled", bump)
    return () => {
      window.removeEventListener("ttm-user-profile-changed", bump)
      window.removeEventListener("ttm-location-settled", bump)
    }
  }, [])

  const user = getUserProfile()
  const premium = Boolean(user && isPremiumActive(user))
  const profileLife = useProfileLife()
  const displayName = useMemo(() => {
    const name = user?.name?.trim()
    if (!name) return null
    return name.split(/\s+/)[0] || name
  }, [user?.name])

  useEffect(() => {
    const bump = () => setProfileTick((x) => x + 1)
    window.addEventListener("ttm-profile-life-updated", bump)
    return () => window.removeEventListener("ttm-profile-life-updated", bump)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    void reloadDeck().then(() => {
      if (cancelled) return
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, reloadDeck])

  const handleProfilesChange = useCallback(
    (update: SwipeProfile[] | ((prev: SwipeProfile[]) => SwipeProfile[])) => {
      setProfiles((prev) => {
        const next = typeof update === "function" ? update(prev) : update
        return next
      })
    },
    []
  )

  useEffect(() => {
    if (!hydrated || !deckBooted || profiles.length > 0) return
    void loadDeck().then((deck) => {
      setDeckEmptyReason(deck.length === 0 ? (isDiscoverFilteredEmpty(locale, resolveDiscoverViewerPosition(location.position), filters) ? "filters" : "swiped") : null)
      setProfiles(deck)
    })
  }, [hydrated, deckBooted, profiles.length, loadDeck, locale, location.position, filters])

  const handleRevive = () => {
    reviveProfilePresence()
    setProfileTick((x) => x + 1)
  }

  const toolbar = (
    <DiscoverToolbar
      compactRow
      premium={premium}
      onBoost={() => openUpgrade("boost")}
      onOpenFilters={() => setFiltersOpen(true)}
    />
  )

  const deck = (
    <SwipeDeck
      cardOnly
      booted={deckBooted && !deckRefreshing}
      profiles={profiles}
      emptyReason={deckEmptyReason}
      onProfilesChange={handleProfilesChange}
      onResetFilters={() => {
        setFilters({})
        saveDiscoverFilters({})
        void reloadDeck({})
      }}
    >
      {({ card, actions, dialogs }) => (
        <div className="ttm-welcome-page">
          {dialogs}
          <DiscoverPitch name={displayName} className="ttm-welcome-page__pitch--mobile" />

          <div className="ttm-welcome-page__grid">
            <aside className="ttm-welcome-page__aside" aria-label={t("discoverAsideAria")}>
              <DiscoverPitch name={displayName} className="ttm-welcome-page__pitch--desktop" />
              <DiscoverAside />
            </aside>

            <div className="ttm-welcome-page__card-col">
              <div className="ttm-welcome-page__card">{card}</div>
              <div
                className="ttm-welcome-page__actions-bar"
                aria-label={t("discoverSwipeActionsAria")}
              >
                {actions ? (
                  <div className="ttm-welcome-page__actions-bar-swipe">{actions}</div>
                ) : null}
                <div className="ttm-welcome-page__actions-bar-tools">{toolbar}</div>
              </div>
            </div>
          </div>

          <div className="ttm-welcome-page__footer--mobile">
            <WelcomeMatchTimer />
            <WelcomeTips />
            <DiscoverAside compact />
          </div>
        </div>
      )}
    </SwipeDeck>
  )

  return (
    <div className="discover-panel-root flex flex-col h-full min-h-0 overflow-hidden">
      <DiscoverAmbient />
      <DiscoverFiltersModal
        open={filtersOpen}
        filters={filters}
        hasLocation={hasDiscoverViewerPosition(location.position)}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next)
          saveDiscoverFilters(next)
          void reloadDeck(next)
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
