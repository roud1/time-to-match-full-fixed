"use client"

import { useEffect, useState } from "react"
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
import { PremiumUpgradeProvider } from "@/components/premium/premium-upgrade-context"
import { ConnectionExtensionToastStack } from "@/components/connection/connection-extension-toast"
import { PremiumUpgradeSheet } from "@/components/premium/premium-upgrade-sheet"
import { PremiumBadgeLink } from "@/components/premium/premium-badge"
import { useI18n } from "@/lib/i18n"
import { getUserProfile, isLoggedIn, isPremiumActive } from "@/lib/user-profile"
import { cn } from "@/lib/utils"
import { recordProfileActivity } from "@/lib/profile-life-store"

export function AppShell() {
  const { t, location } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const tab: AppTab =
    tabParam === "likes" || tabParam === "chat" || tabParam === "map" ? tabParam : "discover"
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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

  useEffect(() => {
    const bump = () => setPremiumTick((x) => x + 1)
    window.addEventListener("ttm-user-profile-changed", bump)
    return () => window.removeEventListener("ttm-user-profile-changed", bump)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </div>
    )
  }

  const headerProfile = getUserProfile()
  const showPremiumBadge = Boolean(headerProfile && isPremiumActive(headerProfile))
  void premiumTick

  const chatWith = searchParams.get("with")
  const chatThreadOpen = tab === "chat" && Boolean(chatWith)
  const immersiveLayout = tab === "discover" || chatThreadOpen

  return (
    <ActivityFeedProvider>
      <PremiumUpgradeProvider>
        <div
          className={cn(
            "min-h-screen bg-[#050506]",
            immersiveLayout && "h-dvh overflow-hidden flex flex-col",
            tab === "discover" && "pb-[5.5rem]",
            !immersiveLayout && "pb-24"
          )}
        >
        {!chatThreadOpen && (
        <header
          className={cn(
            "sticky top-0 z-40 ttm-page py-3 transition-all duration-500",
            scrolled
              ? "premium-nav-scrolled cin-nav-minimal--scrolled border-b border-white/[0.08]"
              : "cin-nav-minimal border-b border-white/[0.05]"
          )}
        >
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-2 w-full",
            tab === "discover" ? "max-w-4xl" : "max-w-lg"
          )}
        >
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <Logo size="sm" />
            <span className="text-sm font-light text-foreground/90 hidden sm:inline group-hover:text-white/75 transition-colors truncate">
              Time to Match
            </span>
          </Link>
          <div className="flex items-center gap-2.5 shrink-0">
            <ActivityAppChrome />
            {showPremiumBadge && <PremiumBadgeLink label={t("premiumTierPlus")} href="/profile?tab=premium" />}
          </div>
        </div>
      </header>
        )}

      <main
        className={cn(
          "mx-auto ttm-page w-full",
          tab === "discover"
            ? "max-w-4xl flex-1 min-h-0 flex flex-col overflow-hidden"
            : chatThreadOpen
              ? "flex-1 min-h-0 max-w-none p-0 overflow-hidden"
              : "max-w-lg"
        )}
      >
        {tab === "discover" && <DiscoverPanel />}
        {tab === "likes" && <LikesPanel />}
        {tab === "chat" && <ChatPanel />}
        {tab === "map" && <MapPanel />}
      </main>

      <BottomNavBar />
        </div>
        <ConnectionExtensionToastStack />
        <PremiumUpgradeSheet />
      </PremiumUpgradeProvider>
    </ActivityFeedProvider>
  )
}
