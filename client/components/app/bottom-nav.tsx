"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/client/lib/utils"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"
import { getActivityCounts } from "@/client/lib/activity-metrics"
import { tapScaleSoft } from "@/client/lib/motion-system"
import { BrandIcon, type BrandIconName } from "@/client/components/brand/brand-icon"
import { NotifyBadge } from "@/client/components/ui/notify-badge"

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
  { id: "profile", href: "/profile", labelKey: "tabProfile", icon: "profile" },
]

function isTabActive(id: BottomNavId, pathname: string, tabParam: string | null): boolean {
  if (id === "profile") return pathname === "/profile" || pathname.startsWith("/profile/")
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
                <span className="ttm-dock-tab__icon-wrap">
                  <BrandIcon name={item.icon} active={isActive} size="md" />
                  {item.id === "likes" && item.badge && (
                    <NotifyBadge count={likesBadge} />
                  )}
                  {item.id === "chat" && <NotifyBadge count={chatBadge} />}
                </span>
                <span className="ttm-dock-tab__label">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </nav>
  )
}
