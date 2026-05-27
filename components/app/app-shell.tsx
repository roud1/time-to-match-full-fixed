"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavBar } from "@/components/app/bottom-nav-bar"
import type { AppTab } from "@/components/app/bottom-nav"
import { DiscoverPanel } from "@/components/app/discover-panel"
import { LikesPanel } from "@/components/app/likes-panel"
import { ChatPanel } from "@/components/app/chat-panel"
import { MapPanel } from "@/components/app/map-panel"
import { Logo } from "@/components/logo"
import { ActivityFeedProvider } from "@/components/activity/activity-feed-context"
import { ActivityAppChrome } from "@/components/activity/activity-app-chrome"
import { HeaderProfileLink } from "@/components/app/header-profile-link"
import { LevelBadge } from "@/components/gamification/level-badge"
import { useUser } from "@/hooks/use-user"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { LiveActivityFeed } from "@/components/live-activity-feed"
import { PremiumUpgradeProvider } from "@/components/premium/premium-upgrade-context"
import { ConnectionExtensionToastStack } from "@/components/connection/connection-extension-toast"
import { PremiumUpgradeSheet } from "@/components/premium/premium-upgrade-sheet"
import { PremiumBadgeLink } from "@/components/premium/premium-badge"
import { AppTabTransition } from "@/components/mobile/app-tab-transition"
import { useI18n } from "@/lib/i18n"
import { getUserProfile, isLoggedIn, isPremiumActive } from "@/lib/user-profile"
import { cn } from "@/lib/utils"
import { recordProfileActivity } from "@/lib/profile-life-store"
import { DailyReturnBanner } from "@/components/growth/daily-return-banner"
import { useGrowthSession } from "@/hooks/use-growth-session"
import { useConnectionCloudSync } from "@/hooks/use-connection-cloud-sync"
import { EmotionalWorldRoot } from "@/components/world/emotional-world-root"
import { EmotionalRetentionStrip } from "@/components/network/emotional-retention-strip"
import { EvolutionEventCelebration } from "@/components/network/evolution-event-celebration"
import { useEvolutionEventScanner } from "@/hooks/use-evolution-event-scanner"
import { PresencePlatformAmbient } from "@/components/presence/presence-platform-ambient"
import { useEmotionalRealityExpansion } from "@/hooks/use-emotional-reality-expansion"
import { useEnergyFeed } from "@/hooks/use-energy-feed"
import { PlatformSoulField } from "@/components/reality-expansion/platform-soul-field"
import { PlatformInsightWhisper } from "@/components/product/platform-insight-whisper"
import { pickPlatformInsight } from "@/lib/product-platform-insight"

export function AppShell() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: AppTab =
    tabParam === "likes" || tabParam === "chat" || tabParam === "map" ? tabParam : "discover"
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add("ttm-native-scroll-lock")
    return () => document.documentElement.classList.remove("ttm-native-scroll-lock")
  }, [])

  useEffect(() => {
    const el = document.querySelector(".ttm-native-app__main--scroll")
    if (!el) {
      setScrolled(window.scrollY > 8)
      const onScroll = () => setScrolled(window.scrollY > 8)
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
    }
    const onScroll = () => setScrolled(el.scrollTop > 8)
    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener("scroll", onScroll)
  }, [tab, ready])

  useEffect(() => {
    if (!getUserProfile()) {
      router.replace("/register")
      return
    }
    if (!isLoggedIn()) {
      router.replace("/login")
      return
    }
    setReady(true)
    recordProfileActivity()
  }, [router])

  useEffect(() => {
    if (!ready || location.status !== "idle") return
    location.requestLocation()
  }, [ready, location.status, location.requestLocation])

  const [premiumTick, setPremiumTick] = useState(0)
  const { user: meUser } = useUser()
  const { insights, showReturn, acknowledgeReturn } = useGrowthSession()
  useConnectionCloudSync(ready)
  useEvolutionEventScanner(ready)

  useEffect(() => {
    const bump = () => setPremiumTick((x) => x + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    return () => window.removeEventListener("ttm-user-profile-changed", bump)
  }, [])

  const reality = useEmotionalRealityExpansion({ locale, position: location.position })
  const energyWhisper = useEnergyFeed()
  const platformInsight = useMemo(
    () =>
      pickPlatformInsight({
        reflection: reality.consciousness.reflection,
        narrative: reality.narrative,
        orchestration: reality.os.orchestration,
        energy: energyWhisper,
      }),
    [
      reality.consciousness.reflection,
      reality.narrative,
      reality.os.orchestration,
      energyWhisper,
    ]
  )
  void premiumTick

  if (!ready) {
    return (
      <div className="ttm-native-app items-center justify-center">
        <p className="text-muted-foreground font-extralight">{t("locationLoading")}</p>
      </div>
    )
  }

  const headerProfile = getUserProfile()
  const showPremiumBadge = Boolean(headerProfile && isPremiumActive(headerProfile))

  const chatWith = searchParams.get("with")
  const chatThreadOpen = tab === "chat" && Boolean(chatWith)
  const immersiveTab = tab === "discover"
  const showHeader = !chatThreadOpen
  const showDock = !chatThreadOpen

  return (
    <ActivityFeedProvider>
      <PremiumUpgradeProvider>
        <EmotionalWorldRoot
          ambient
          className="ttm-native-app"
          locale={locale}
          position={location.position}
        >
          {showHeader && (
            <header
              className={cn(
                "ttm-floating-header py-2.5",
                scrolled && "ttm-floating-header--scrolled"
              )}
            >
              <div
                className={cn(
                  "mx-auto flex items-center justify-between gap-2 w-full ttm-page ttm-page--app",
                  immersiveTab ? "max-w-4xl" : "max-w-lg"
                )}
              >
                <Link href="/" className="flex items-center gap-2 group min-w-0 ttm-tactile">
                  <Logo size="sm" />
                  <span className="text-sm font-normal text-foreground/90 hidden sm:inline group-hover:text-foreground transition-colors truncate">
                    Time to Match
                  </span>
                </Link>
                <div className="flex items-center gap-2 shrink-0 min-w-0">
                  {meUser?.level != null && meUser.id !== "local" && (
                    <LevelBadge level={meUser.level} />
                  )}
                  <HeaderProfileLink className="shrink-0" />
                  <ActivityAppChrome />
                  <ThemeToggle compact className="shrink-0" />
                  {showPremiumBadge && (
                    <PremiumBadgeLink label={t("premiumTierPlus")} href="/profile?tab=premium" />
                  )}
                </div>
              </div>
            </header>
          )}

          {showHeader && (
            <>
              <PlatformInsightWhisper
                insight={platformInsight}
                className="mx-auto max-w-lg w-full px-4 pt-1 mb-1"
              />
              {!platformInsight && (
                <PresencePlatformAmbient className="mx-auto max-w-lg w-full px-4 -mt-0.5 mb-1" />
              )}
              <PlatformSoulField
                soul={reality.soul}
                className="mx-auto max-w-lg w-full px-4 mb-1 hidden sm:block"
              />
              <EmotionalRetentionStrip className="mx-auto max-w-lg w-full px-3 mb-2" />
              <DailyReturnBanner
                insights={insights}
                open={showReturn}
                onDismiss={acknowledgeReturn}
              />
            </>
          )}

          <main
            className={cn(
              "ttm-native-app__main mx-auto w-full ttm-page ttm-page--app",
              immersiveTab
                ? "flex flex-col overflow-hidden max-w-4xl"
                : chatThreadOpen
                  ? "relative flex flex-col flex-1 min-h-0 overflow-hidden w-full max-w-lg md:max-w-none"
                  : "ttm-native-app__main--scroll max-w-lg",
              showDock && "pb-[var(--ttm-dock-height)]"
            )}
          >
            <AppTabTransition tab={tab}>
              {tab === "discover" && <DiscoverPanel />}
              {tab === "likes" && <LikesPanel />}
              {tab === "chat" && <ChatPanel />}
              {tab === "map" && <MapPanel />}
            </AppTabTransition>
          </main>

          {showDock && <BottomNavBar />}
          {showHeader && tab !== "map" && (
            <div className="p9-live-energy pointer-events-none sm:pointer-events-auto">
              <LiveActivityFeed appearDelayMs={2400} />
            </div>
          )}
        </EmotionalWorldRoot>
        <EvolutionEventCelebration />
        <ConnectionExtensionToastStack />
        <PremiumUpgradeSheet />
      </PremiumUpgradeProvider>
    </ActivityFeedProvider>
  )
}
