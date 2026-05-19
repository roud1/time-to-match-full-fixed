"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { buildDemoSwipeProfiles, type SwipeProfile } from "@/lib/demo-profiles"
import { SwipeDeck } from "@/components/app/swipe-deck"

export function DiscoverPanel() {
  const { t, locale, location } = useI18n()
  const [profiles, setProfiles] = useState<SwipeProfile[]>([])

  useEffect(() => {
    setProfiles(buildDemoSwipeProfiles(locale, location.position))
  }, [locale, location.position])

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-extralight tracking-tight">{t("tabDiscover")}</h1>
        <p className="text-sm text-muted-foreground font-light mt-1">{t("swipeSubtitle")}</p>
      </div>
      <SwipeDeck profiles={profiles} onProfilesChange={setProfiles} />
    </div>
  )
}
