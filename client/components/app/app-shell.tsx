"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BottomNavBar } from "@/client/components/app/bottom-nav-bar"
import type { AppTab } from "@/client/components/app/bottom-nav"
import { DiscoverPanel } from "@/client/components/app/discover-panel"
import { LikesPanel } from "@/client/components/app/likes-panel"
import { ChatPanel } from "@/client/components/app/chat-panel"
import { MapPanel } from "@/client/components/app/map-panel"
import { Logo } from "@/client/components/logo"
import { ActivityFeedProvider } from "@/client/components/activity/activity-feed-context"
import { ActivityAppChrome } from "@/client/components/activity/activity-app-chrome"
import { LevelBadge } from "@/client/components/gamification/level-badge"
import { useUser } from "@/client/hooks/use-user"
import { ThemeToggle } from "@/client/components/theme/theme-toggle"
import { PremiumUpgradeProvider } from "@/client/components/premium/premium-upgrade-context"
import { ConnectionExtensionToastStack } from "@/client/components/connection/connection-extension-toast"
import { PremiumUpgradeSheet } from "@/client/components/premium/premium-upgrade-sheet"
import { PaywallModal } from "@/client/components/premium/paywall-modal"
import { PremiumBadgeLink } from "@/client/components/premium/premium-badge"
import { AppTabTransition } from "@/client/components/mobile/app-tab-transition"
import { useI18n } from "@/client/lib/i18n"
import { fetchMe } from "@/client/lib/user/api"
import { getUserProfile, isLoggedIn, isPremiumActive } from "@/client/lib/user-profile"
import { cn } from "@/client/lib/utils"
import { recordProfileActivity } from "@/client/lib/profile-life-store"
import { DailyReturnBanner } from "@/client/components/growth/daily-return-banner"
import { useGrowthSession } from "@/client/hooks/use-growth-session"
import { useConnectionCloudSync } from "@/client/hooks/use-connection-cloud-sync"
import { EmotionalWorldRoot } from "@/client/components/world/emotional-world-root"
import { EmotionalRetentionStrip } from "@/client/components/network/emotional-retention-strip"
import { EvolutionEventCelebration } from "@/client/components/network/evolution-event-celebration"
import { useEvolutionEventScanner } from "@/client/hooks/use-evolution-event-scanner"
import { PresencePlatformAmbient } from "@/client/components/presence/presence-platform-ambient"
import { useEmotionalRealityExpansion } from "@/client/hooks/use-emotional-reality-expansion"
import { useEnergyFeed } from "@/client/hooks/use-energy-feed"
import { PlatformSoulField } from "@/client/components/reality-expansion/platform-soul-field"
import { PlatformInsightWhisper } from "@/client/components/product/platform-insight-whisper"
import { pickPlatformInsight } from "@/client/lib/product-platform-insight"
import { GeolocationBootstrap } from "@/client/components/geolocation-bootstrap"
import { LocationBanner } from "@/client/components/location-control"
import { DesktopAppNav } from "@/client/components/layout/desktop-app-nav"
import { useDesktopAppNav } from "@/client/hooks/use-desktop-app-nav"
import { isEmotionalOsEnabled } from "@/client/lib/feature-flags"

const PAGE_MAX_WIDE = "max-w-[min(1200px,100%)]"
const PAGE_MAX_NARROW = "max-w-lg"

export function AppShell() {
  const { t, locale, location } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: AppTab =
    tabParam === "likes" || tabParam === "chat" || tabParam === "map" ? tabParam : "discover"
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isDesktopNav = useDesktopAppNav()

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
    let cancelled = false

    async function init() {
      const me = await fetchMe()
      if (cancelled) return

      if (!me) {
        router.replace("/login")
        return
      }

      if (!getUserProfile()) {
        router.replace("/register")
        return
      }

      if (me.id === "local" && !isLoggedIn()) {
        router.replace("/login")
        return
      }

      setReady(true)
      recordProfileActivity()
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [router])

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
  const emotionalOs = isEmotionalOsEnabled()
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
      <div className="ttm-app-loading ttm-native-app" aria-busy aria-label={t("locationLoading")}>
        <div className="ttm-app-loading__skeleton" aria-hidden>
          <div className="ttm-app-loading__bar ttm-app-loading__bar--wide" />
          <div className="ttm-app-loading__bar ttm-app-loading__bar--mid" />
          <div className="ttm-app-loading__bar ttm-app-loading__bar--short" />
        </div>
        <p className="font-extralight text-sm">{t("locationLoading")}</p>
      </div>
    )
  }

  const headerProfile = getUserProfile()
  const showPremiumBadge = Boolean(headerProfile && isPremiumActive(headerProfile))

  const chatWith = searchParams.get("with")
  const chatThreadOpen = tab === "chat" && Boolean(chatWith)
  const immersiveTab = tab === "discover"
  const likesTab = tab === "likes"
  const chatTab = tab === "chat"
  const mapTab = tab === "map"
  const wideTab = immersiveTab || likesTab || chatTab || mapTab
  const pageMax = wideTab ? PAGE_MAX_WIDE : PAGE_MAX_NARROW
  const mobileChatRoom = chatTab && chatThreadOpen && !isDesktopNav
  const desktopChatThread = chatTab && chatThreadOpen && isDesktopNav
  const showHeader = !mobileChatRoom
  const showDock = !mobileChatRoom && !isDesktopNav

  return (
    <ActivityFeedProvider>
      <PremiumUpgradeProvider>
        <EmotionalWorldRoot
          ambient
          className={cn(
            "ttm-native-app ttm-dating-ui ttm-with-desktop-nav",
            immersiveTab && "ttm-native-app--discover",
            likesTab && "ttm-native-app--likes",
            chatTab && "ttm-native-app--chat",
            mapTab && "ttm-native-app--map"
          )}
          locale={locale}
          position={location.position}
        >
          {ready && (
            <>
              <Suspense fallback={null}>
                <DesktopAppNav />
              </Suspense>
              <GeolocationBootstrap autoRequest />
              <LocationBanner />
            </>
          )}
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
                  pageMax
                )}
              >
                <Link href="/" className="flex items-center gap-2 group min-w-0 ttm-tactile" aria-label="Time to Match">
                  <Logo variant="full" size="sm" className="hidden sm:inline-flex" />
                  <Logo variant="icon" size="sm" className="sm:hidden" />
                </Link>
                <div className="flex items-center gap-2 shrink-0 min-w-0">
                  {meUser?.level != null && meUser.id !== "local" && (
                    <LevelBadge level={meUser.level} />
                  )}
                  <ActivityAppChrome />
                  <ThemeToggle compact className="shrink-0" />
                  {showPremiumBadge && (
                    <PremiumBadgeLink label={t("premiumTierPlus")} href="/profile?tab=premium" />
                  )}
                </div>
              </div>
            </header>
          )}

          {showHeader && !immersiveTab && !desktopChatThread && emotionalOs && (
            <>
              <PlatformInsightWhisper
                insight={platformInsight}
                className={cn("mx-auto w-full px-4 pt-1 mb-1", wideTab ? pageMax : PAGE_MAX_NARROW)}
              />
              {!platformInsight && (
                <PresencePlatformAmbient
                  className={cn("mx-auto w-full px-4 -mt-0.5 mb-1", wideTab ? pageMax : PAGE_MAX_NARROW)}
                />
              )}
              <PlatformSoulField
                soul={reality.soul}
                className={cn(
                  "mx-auto w-full px-4 mb-1 hidden sm:block",
                  wideTab ? pageMax : PAGE_MAX_NARROW
                )}
              />
              <EmotionalRetentionStrip
                className={cn("mx-auto w-full px-3 mb-2", wideTab ? pageMax : PAGE_MAX_NARROW)}
              />
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
                ? "flex flex-col overflow-hidden max-w-[min(1200px,100%)] w-full"
                : mobileChatRoom
                  ? "relative flex flex-col flex-1 min-h-0 overflow-hidden w-full max-w-lg md:max-w-none"
                  : (chatTab || mapTab) && isDesktopNav
                    ? cn("flex flex-col flex-1 min-h-0 overflow-hidden w-full", PAGE_MAX_WIDE)
                    : wideTab
                      ? cn("ttm-native-app__main--scroll w-full", PAGE_MAX_WIDE)
                      : cn("ttm-native-app__main--scroll", PAGE_MAX_NARROW),
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
        </EmotionalWorldRoot>
        {emotionalOs ? <EvolutionEventCelebration /> : null}
        <ConnectionExtensionToastStack />
        <PremiumUpgradeSheet />
        <PaywallModal />
      </PremiumUpgradeProvider>
    </ActivityFeedProvider>
  )
}
