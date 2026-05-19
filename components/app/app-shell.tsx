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
import { useI18n } from "@/lib/i18n"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function AppShell() {
  const { t } = useI18n()
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
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">{t("locationLoading")}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header
        className={cn(
          "sticky top-0 z-40 px-4 py-3 transition-all duration-500",
          scrolled
            ? "premium-nav-scrolled border-b border-foreground/10 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
            : "glass border-b border-foreground/5"
        )}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" />
            <span className="text-sm font-light text-foreground/90 hidden sm:inline group-hover:text-pink-300 transition-colors">
              Time to Match
            </span>
          </Link>
          <Link
            href="/profile"
            className="text-xs font-light text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full border border-foreground/10 hover:border-pink-500/30 transition-colors"
          >
            {t("navProfile")}
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        {tab === "discover" && <DiscoverPanel />}
        {tab === "likes" && <LikesPanel onMatch={() => router.push("/app?tab=chat")} />}
        {tab === "chat" && <ChatPanel />}
        {tab === "map" && <MapPanel />}
      </main>

      <BottomNavBar />
    </div>
  )
}
