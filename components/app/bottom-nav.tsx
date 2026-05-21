"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import { getActivityCounts } from "@/lib/activity-metrics"

export type AppTab = "discover" | "likes" | "chat" | "map"
export type BottomNavId = AppTab | "profile"

type NavItem = {
  id: BottomNavId
  href: string
  labelKey: TranslationKey
  icon: (active: boolean) => ReactNode
  badge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "discover",
    href: "/app",
    labelKey: "tabDiscover",
    icon: (active) => (
      <svg className={cn("w-6 h-6", active && "text-white/85")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "likes",
    href: "/app?tab=likes",
    labelKey: "tabLikes",
    badge: true,
    icon: (active) => (
      <svg className={cn("w-6 h-6", active && "text-white/85")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: "chat",
    href: "/app?tab=chat",
    labelKey: "tabChat",
    icon: (active) => (
      <svg className={cn("w-6 h-6", active && "text-white/85")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: "map",
    href: "/app?tab=map",
    labelKey: "tabMap",
    icon: (active) => (
      <svg className={cn("w-6 h-6", active && "text-white/85")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: "profile",
    href: "/profile",
    labelKey: "navProfile",
    icon: (active) => (
      <svg className={cn("w-6 h-6", active && "text-white/85")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

function isTabActive(id: BottomNavId, pathname: string, tabParam: string | null): boolean {
  if (id === "profile") return pathname === "/profile"
  if (pathname !== "/app") return false
  if (id === "discover") return !tabParam || tabParam === "discover"
  return tabParam === id
}

type BottomNavProps = {
  active?: BottomNavId
}

export function BottomNav({ active: activeOverride }: BottomNavProps) {
  const { t, locale, location } = useI18n()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [likesBadge, setLikesBadge] = useState(0)
  const [chatBadge, setChatBadge] = useState(0)

  useEffect(() => {
    const c = getActivityCounts(locale, location.position)
    setLikesBadge(c.likesUnread)
    setChatBadge(c.chatsUnread)
  }, [locale, location.position, pathname, tabParam])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-4 pb-4 pt-2 pointer-events-none">
      <div className="premium-nav-scrolled cin-nav-minimal ttm-bottom-nav-shell rounded-2xl mx-auto max-w-lg flex items-stretch pointer-events-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activeOverride !== undefined
              ? activeOverride === item.id
              : isTabActive(item.id, pathname, tabParam)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-all duration-500 min-w-0 min-h-[52px] touch-manipulation",
                item.id === "profile" && "mx-0.5 rounded-xl",
                item.id === "profile" && isActive && "cin-nav-profile-active scale-[1.02]",
                item.id === "profile" && !isActive && "cin-nav-tab-idle border border-transparent",
                item.id !== "profile" && (isActive ? "cin-nav-tab-active" : "cin-nav-tab-idle")
              )}
            >
              {item.icon(isActive)}
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] tracking-[0.08em] truncate max-w-full px-0.5 font-light",
                  item.id === "profile" && isActive && "text-white/90"
                )}
              >
                {t(item.labelKey)}
              </span>
              {item.id === "likes" && item.badge && likesBadge > 0 && (
                <span className="absolute top-1 right-1 sm:right-2 cin-badge">
                  {likesBadge > 9 ? "9+" : likesBadge}
                </span>
              )}
              {item.id === "chat" && chatBadge > 0 && (
                <span className="absolute top-1 right-1 sm:right-2 min-w-[16px] h-4 px-1 rounded-full bg-white/20 border border-white/25 text-[9px] text-white flex items-center justify-center">
                  {chatBadge > 9 ? "9+" : chatBadge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
