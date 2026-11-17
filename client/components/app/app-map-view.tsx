"use client"

import "./app-map.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ChevronRight, LocateFixed, MapPin, SlidersHorizontal } from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { fetchDiscoverProfiles, postDiscoverLike, postDiscoverPass } from "@/client/lib/discover/api"
import { resolveDiscoverViewerPosition, hasDiscoverViewerPosition } from "@/client/lib/discover/viewer-position"
import { discoverProfileToSwipe } from "@/client/lib/discover/map-profile"
import { loadDiscoverFilters, saveDiscoverFilters } from "@/client/lib/discover/filters-storage"
import type { DiscoverFilters, DiscoverProfile } from "@/client/lib/discover/types"
import type { SwipeProfile } from "@/client/lib/demo-profiles"
import { DiscoverFiltersModal } from "@/client/components/discover/discover-filters-modal"
import { SwipeProfileDetailScreen } from "@/client/components/app/swipe-profile-detail-screen"
import { getPeerTrustSignals } from "@/client/lib/demo-trust-signals"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"
import { cn } from "@/client/lib/utils"

type Pin = { profile: DiscoverProfile; x: number; y: number }

const EARTH_KM = 6371

/** East/north offset in km from the viewer (equirectangular — fine for city distances). */
function offsetKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const rad = Math.PI / 180
  const dx = (to.lng - from.lng) * rad * EARTH_KM * Math.cos(((from.lat + to.lat) / 2) * rad)
  const dy = (to.lat - from.lat) * rad * EARTH_KM
  return { dx, dy }
}

/** A "nice" ring radius for the scale label: 0.5, 1, 1.5, 2, 3, 5, 10 … km. */
function niceKm(km: number) {
  const steps = [0.5, 1, 1.5, 2, 3, 5, 10, 15, 20, 30, 50, 100, 200, 500]
  return steps.find((s) => s >= km) ?? Math.ceil(km / 100) * 100
}

/** Scale of the inner ring: one decimal below 10 km ("0,5 км", "1,5 км"). */
function formatRing(km: number, unit: string) {
  return `${km < 10 ? String(Math.round(km * 10) / 10).replace(".", ",") : Math.round(km)} ${unit}`
}

function formatKm(km: number, unit: string) {
  if (km < 1) return `< 1 ${unit}`
  return `${km < 10 ? String(Math.round(km * 10) / 10).replace(".", ",") : Math.round(km)} ${unit}`
}

/**
 * Map ("Карта") of the native app / installed PWA — rendered only when html[data-ttm-app] is set.
 * Real people only: the same server feed as discover, placed by their real direction and distance.
 */
export function AppMapView() {
  const { t, locale, location } = useI18n()
  const [filters, setFilters] = useState<DiscoverFilters>(() => loadDiscoverFilters())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [people, setPeople] = useState<DiscoverProfile[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<SwipeProfile | null>(null)

  const viewer = resolveDiscoverViewerPosition(location.position)

  const load = useCallback(
    async (active: DiscoverFilters) => {
      if (!viewer) {
        setPeople([])
        return
      }
      const { profiles } = await fetchDiscoverProfiles(active, viewer, { limit: 50 })
      setPeople(profiles.filter((p) => p.lat != null && p.lng != null))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [viewer?.lat, viewer?.lng]
  )

  useEffect(() => {
    void load(filters)
  }, [load, filters])

  const { pins, ringKm } = useMemo(() => {
    if (!viewer || !people?.length) return { pins: [] as Pin[], ringKm: 1 }
    const offsets = people.map((p) => ({ p, ...offsetKm(viewer, { lat: p.lat!, lng: p.lng! }) }))
    const far = Math.max(...offsets.map((o) => Math.hypot(o.dx, o.dy)), 0.3)
    const outer = niceKm(far)
    // Outer ring = 42% of the stage; avatars never leave the stage.
    const pinsOut = offsets.map(({ p, dx, dy }, i) => {
      const k = 42 / outer
      let x = dx * k
      let y = dy * k
      // Someone standing right next to you would hide your own marker: keep a small gap around the centre.
      if (Math.hypot(x, y) < 11) {
        const angle = Math.atan2(y, x) || (i * 2.4 + 0.8)
        x = Math.cos(angle) * 11
        y = Math.sin(angle) * 11
      }
      return { profile: p, x: 50 + Math.max(-44, Math.min(44, x)), y: 50 - Math.max(-44, Math.min(44, y)) }
    })
    return { pins: pinsOut, ringKm: outer / 2 }
  }, [viewer, people])

  useEffect(() => {
    if (!pins.length) setSelectedId(null)
    else if (!pins.some((p) => p.profile.id === selectedId)) {
      const nearest = [...pins].sort((a, b) => (a.profile.distanceKm ?? 1e9) - (b.profile.distanceKm ?? 1e9))[0]
      setSelectedId(nearest.profile.id)
    }
  }, [pins, selectedId])

  const selected = pins.find((p) => p.profile.id === selectedId)?.profile ?? null
  const kmUnit = t("discoverFiltersKm")

  return (
    <div className="ttm-app-map">
      <div className="ttm-app-map__top">
        <h1 className="ttm-app-map__title">
          <MapPin aria-hidden strokeWidth={2} />
          {t("tabMap")}
        </h1>
        <button
          type="button"
          className="ttm-app-map__icon-btn"
          aria-label={t("discoverFiltersOpen")}
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal aria-hidden strokeWidth={1.8} />
        </button>
      </div>

      <div className="ttm-app-map__stage" aria-label={t("mapListAria")}>
        <div className="ttm-app-map__grid" aria-hidden />
        <span className="ttm-app-map__ring ttm-app-map__ring--outer" aria-hidden />
        <span className="ttm-app-map__ring ttm-app-map__ring--inner" aria-hidden />
        {pins.length > 0 && <span className="ttm-app-map__scale">~ {formatRing(ringKm, kmUnit)}</span>}
        <span className="ttm-app-map__me" aria-label={t("mapYou")}>
          <span />
        </span>

        {pins.map(({ profile, x, y }) => (
          <button
            key={profile.id}
            type="button"
            className={cn("ttm-app-map__pin", profile.id === selectedId && "is-selected")}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => setSelectedId(profile.id)}
            aria-label={`${profile.name}, ${profile.age}`}
          >
            <Image src={profile.image} alt="" fill sizes="52px" className="object-cover" />
          </button>
        ))}

        {people != null && pins.length === 0 && (
          <div className="ttm-app-map__empty">
            <p className="ttm-app-map__empty-title">
              {viewer ? t("appMapEmptyTitle") : t("appMapNoLocationTitle")}
            </p>
            <p className="ttm-app-map__empty-body">{viewer ? t("appMapEmptyBody") : t("appMapNoLocationBody")}</p>
          </div>
        )}

        <button
          type="button"
          className="ttm-app-map__locate"
          aria-label={t("appMapLocate")}
          onClick={() => location.requestLocation()}
        >
          <LocateFixed aria-hidden strokeWidth={1.8} />
        </button>
      </div>

      {selected && (
        <div className="ttm-app-map__person">
          <span className="ttm-app-map__person-photo">
            <Image src={selected.image} alt="" fill sizes="64px" className="object-cover" />
          </span>
          <span className="ttm-app-map__person-text">
            <span className="ttm-app-map__person-name">
              <span className="truncate">
                {selected.name}, {selected.age}
              </span>
              {selected.photoVerified && <VerifiedBadge size={16} title={t("photoVerifiedLabel")} />}
            </span>
            <span className="ttm-app-map__person-meta">
              {[selected.distanceKm != null ? formatKm(selected.distanceKm, kmUnit) : null, selected.location]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </span>
          <button
            type="button"
            className="ttm-app-map__open"
            onClick={() => setDetail(discoverProfileToSwipe(selected, locale))}
          >
            {t("appMapOpen")}
            <ChevronRight aria-hidden strokeWidth={2} />
          </button>
        </div>
      )}

      <DiscoverFiltersModal
        open={filtersOpen}
        filters={filters}
        hasLocation={hasDiscoverViewerPosition(location.position)}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next)
          saveDiscoverFilters(next)
        }}
      />

      <SwipeProfileDetailScreen
        profile={detail}
        initialPhotoIndex={0}
        trust={detail ? getPeerTrustSignals(detail.id) : undefined}
        onClose={() => setDetail(null)}
        onLike={() => {
          if (detail?.userId) void postDiscoverLike(detail.userId).then(() => load(filters))
          setDetail(null)
        }}
        onNope={() => {
          if (detail?.userId) void postDiscoverPass(detail.userId).then(() => load(filters))
          setDetail(null)
        }}
        onOpenSafety={() => setDetail(null)}
      />
    </div>
  )
}
