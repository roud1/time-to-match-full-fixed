"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import { getActivityCounts } from "@/lib/activity-metrics"
import { tapScaleSoft } from "@/lib/motion-system"
import { BrandIcon, type BrandIconName } from "@/components/brand/brand-icon"

export type AppTab = "discover" | "likes" | "chat" | "map"
export type BottomNavId = AppTab | "profile"

type NavItem = {
  id: BottomNavId
  href: string
  labelKey: TranslationKey
  icon: BrandIconName
  badge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "discover", href: "/app", labelKey: "tabDiscover", icon: "discover" },
  { id: "likes", href: "/app?tab=likes", labelKey: "tabLikes", icon: "likes", badge: true },
  { id: "chat", href: "/app?tab=chat", labelKey: "tabChat", icon: "chat" },
  { id: "map", href: "/app?tab=map", labelKey: "tabMap", icon: "map" },
  { id: "profile", href: "/profile", labelKey: "navProfile", icon: "profile" },
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
  const reduce = useReducedMotion()
  const [likesBadge, setLikesBadge] = useState(0)
  const [chatBadge, setChatBadge] = useState(0)

  useEffect(() => {
    const c = getActivityCounts(locale, location.position)
    setLikesBadge(c.likesUnread)
    setChatBadge(c.chatsUnread)
  }, [locale, location.position, pathname, tabParam])

  return (
    <nav className="ttm-floating-dock" aria-label="App">
      <div className="ttm-floating-dock__inner ttm-brand-glass-float ttm-gpu-layer">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activeOverride !== undefined
              ? activeOverride === item.id
              : isTabActive(item.id, pathname, tabParam)
          return (
            <motion.div key={item.id} className="flex-1 min-w-0" whileTap={reduce ? undefined : tapScaleSoft}>
              <Link
                href={item.href}
                className={cn(
                  "ttm-dock-tab ttm-brand-interactive relative w-full",
                  isActive ? "ttm-dock-tab--active" : "ttm-dock-tab--idle"
                )}
              >
                <BrandIcon name={item.icon} active={isActive} size="md" />
                <span className="ttm-dock-tab__label">{t(item.labelKey)}</span>
                {item.id === "likes" && item.badge && likesBadge > 0 && (
                  <span className="absolute top-0.5 right-1 sm:right-2 cin-badge">
                    {likesBadge > 9 ? "9+" : likesBadge}
                  </span>
                )}
                {item.id === "chat" && chatBadge > 0 && (
                  <span className="absolute top-0.5 right-1 sm:right-2 min-w-[16px] h-4 px-1 rounded-full bg-white/20 border border-white/25 text-[9px] text-white flex items-center justify-center">
                    {chatBadge > 9 ? "9+" : chatBadge}
                  </span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
