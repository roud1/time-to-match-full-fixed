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
import { useLuviaUi } from "@/client/hooks/use-ttm-app"
import { Flame, MapPin, MessageCircle, User, VenetianMask } from "lucide-react"
import "@/client/components/app/app-dock.css"

export type AppTab = "discover" | "likes" | "chat" | "map"
export type BottomNavId = AppTab | "profile" | "blind"

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

/** App only: five tabs as in the app mockup (likes open from the heart in the header). */
const APP_NAV_ITEMS: Array<{ id: BottomNavId; href: string; labelKey: TranslationKey; Icon: typeof Flame }> = [
  { id: "discover", href: "/app", labelKey: "appNavDiscover", Icon: Flame },
  { id: "blind", href: "/app/blind-date", labelKey: "bdNav", Icon: VenetianMask },
  { id: "map", href: "/app?tab=map", labelKey: "tabMap", Icon: MapPin },
  { id: "chat", href: "/app?tab=chat", labelKey: "appNavChats", Icon: MessageCircle },
  { id: "profile", href: "/profile", labelKey: "tabProfile", Icon: User },
]

function isTabActive(id: BottomNavId, pathname: string, tabParam: string | null): boolean {
  if (id === "profile") return pathname === "/profile" || pathname.startsWith("/profile/")
  if (id === "blind") return pathname === "/app/blind-date"
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
  const inApp = useLuviaUi()

  useEffect(() => {
    const c = getActivityCounts(locale, location.position)
    setLikesBadge(c.likesUnread)
    setChatBadge(c.chatsUnread)
  }, [locale, location.position, pathname, tabParam])

  if (inApp) {
    return (
      <nav className="ttm-app-dock" aria-label="App">
        <div className="ttm-app-dock__inner">
          {APP_NAV_ITEMS.map(({ id, href, labelKey, Icon }) => {
            const isActive =
              activeOverride !== undefined ? activeOverride === id : isTabActive(id, pathname, tabParam)
            return (
              <Link
                key={id}
                href={href}
                className={cn("ttm-app-dock__tab", isActive && "is-active")}
                aria-current={isActive ? "page" : undefined}
                aria-label={t(labelKey)}
              >
                <span className="ttm-app-dock__icon">
                  <Icon
                    aria-hidden
                    strokeWidth={isActive ? 2 : 1.7}
                    fill={isActive && id === "discover" ? "currentColor" : "none"}
                  />
                  {id === "chat" && <NotifyBadge count={chatBadge} />}
                </span>
                <span className="lv-sr-only">{t(labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    )
  }

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
