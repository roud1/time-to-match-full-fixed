"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { buildDemoSwipeProfiles } from "@/lib/demo-profiles"
import { filterProfilesForUser } from "@/lib/swipe-gender-filter"
import { getCityCoords } from "@/lib/cities"
import type { GeoPosition } from "@/lib/geo"

const NearbyMap = dynamic(() => import("@/components/app/nearby-map").then((m) => m.NearbyMap), {
  ssr: false,
  loading: () => (
    <div className="h-[min(60vh,520px)] rounded-2xl glass flex items-center justify-center">
      <p className="text-muted-foreground font-light text-sm">…</p>
    </div>
  ),
})

export function MapPanel() {
  const { t, locale, location } = useI18n()
  const [position, setPosition] = useState<GeoPosition | null>(null)

  useEffect(() => {
    setPosition(location.position ?? getCityCoords("kyiv"))
  }, [location.position])

  const profiles = filterProfilesForUser(buildDemoSwipeProfiles(locale, position))

  return (
    <div className="px-4 pt-4 pb-6 max-w-lg mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-extralight tracking-tight">{t("tabMap")}</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t("mapSubtitle")}</p>
      </div>

      <div className="h-[min(60vh,520px)] rounded-2xl overflow-hidden border border-foreground/10">
        {position ? (
          <NearbyMap
            userPosition={position}
            profiles={profiles}
            userLabel={t("mapYou")}
          />
        ) : (
          <div className="h-full glass flex items-center justify-center">
            <p className="text-muted-foreground font-light text-sm">{t("locationLoading")}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/70 font-light mt-3 text-center">{t("mapHint")}</p>
    </div>
  )
}
