"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { buildDemoSwipeProfiles } from "@/lib/demo-profiles"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import { getCityCoords } from "@/lib/cities"
import type { GeoPosition } from "@/lib/geo"
import { getPeerTrustSignals } from "@/lib/demo-trust-signals"
import { SwipeProfileDetailScreen } from "@/components/app/swipe-profile-detail-screen"
import { useDesktopAppNav } from "@/hooks/use-desktop-app-nav"
import { cn } from "@/lib/utils"

const NearbyMap = dynamic(() => import("@/components/app/nearby-map").then((m) => m.NearbyMap), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[280px] flex items-center justify-center bg-[#0a0a0f]/80">
      <p className="text-muted-foreground font-light text-sm">…</p>
    </div>
  ),
})

export function MapPanel() {
  const { t, locale, location } = useI18n()
  const isDesktop = useDesktopAppNav()
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailProfile, setDetailProfile] = useState<SwipeProfile | null>(null)

  useEffect(() => {
    setPosition(location.position ?? getCityCoords("kyiv"))
  }, [location.position])

  const profiles = useMemo(
    () => filterProfilesForUser(buildDemoSwipeProfiles(locale, position)),
    [locale, position]
  )

  useEffect(() => {
    if (profiles.length === 0) {
      setSelectedId(null)
      return
    }
    if (selectedId == null || !profiles.some((p) => p.id === selectedId)) {
      setSelectedId(profiles[0].id)
    }
  }, [profiles, selectedId])

  const selected = profiles.find((p) => p.id === selectedId) ?? null
  const countLabel = t("mapNearbyCount").replace("{count}", String(profiles.length))

  const openDetail = (profile: SwipeProfile) => {
    setSelectedId(profile.id)
    setDetailProfile(profile)
  }

  const mapBlock = position ? (
    <NearbyMap
      userPosition={position}
      profiles={profiles}
      userLabel={t("mapYou")}
      selectedProfileId={selectedId}
      onSelectProfile={(id) => {
        setSelectedId(id)
        if (!isDesktop) {
          const p = profiles.find((x) => x.id === id)
          if (p) openDetail(p)
        }
      }}
      onOpenProfile={(id) => {
        const p = profiles.find((x) => x.id === id)
        if (p) openDetail(p)
      }}
      openProfileLabel={t("mapViewProfile")}
    />
  ) : (
    <div className="h-full min-h-[280px] flex items-center justify-center">
      <p className="text-muted-foreground font-light text-sm">{t("locationLoading")}</p>
    </div>
  )

  return (
    <div className="ttm-map-page">
      <header className="ttm-map-page__header">
        <h1 className="ttm-map-page__title">{t("tabMap")}</h1>
        <p className="ttm-map-page__subtitle">{t("mapSubtitle")}</p>
      </header>

      <div className="ttm-map-page__body">
        {isDesktop && profiles.length > 0 && (
          <aside className="ttm-map-page__aside" aria-label={t("mapListAria")}>
            <div className="ttm-map-page__stat ttm-brand-glass">
              <p className="ttm-map-page__stat-value">{profiles.length}</p>
              <p className="ttm-map-page__stat-label">{countLabel}</p>
            </div>
            <div className="ttm-map-page__list">
              {profiles.map((profile) => {
                const active = profile.id === selectedId
                return (
                  <div
                    key={profile.id}
                    role="button"
                    tabIndex={0}
                    className={cn("ttm-map-page__row", active && "ttm-map-page__row--active")}
                    onClick={() => setSelectedId(profile.id)}
                    onDoubleClick={() => openDetail(profile)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedId(profile.id)
                      }
                    }}
                  >
                    <div className="ttm-map-page__row-media">
                      <Image
                        src={profile.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div className="ttm-map-page__row-body">
                      <p className="ttm-map-page__row-name">
                        {profile.name}, {profile.age}
                      </p>
                      <p className="ttm-map-page__row-meta">
                        {profile.location} · {profile.distance}
                      </p>
                      {active && (
                        <button
                          type="button"
                          className="ttm-map-page__open-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDetail(profile)
                          }}
                        >
                          {t("mapViewProfile")} →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        )}

        <div
          className={cn(
            "ttm-map-page__map-wrap",
            !isDesktop && "ttm-map-page__map-wrap--mobile"
          )}
        >
          {mapBlock}
        </div>
      </div>

      {!isDesktop && <p className="ttm-map-page__hint">{t("mapHint")}</p>}

      <SwipeProfileDetailScreen
        profile={detailProfile}
        context="discover"
        trust={detailProfile ? getPeerTrustSignals(detailProfile.id) : undefined}
        onClose={() => setDetailProfile(null)}
        onLike={() => setDetailProfile(null)}
        onNope={() => setDetailProfile(null)}
      />
    </div>
  )
}
