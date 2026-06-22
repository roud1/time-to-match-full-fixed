"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Compass, Heart, MapPin, MessageCircle, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { useI18n, type TranslationKey } from "@/lib/i18n"
import type { AppTab } from "@/components/app/bottom-nav"

const ITEMS: { tab: AppTab; icon: typeof Compass; labelKey: TranslationKey }[] = [
  { tab: "discover", icon: Compass, labelKey: "tabDiscover" },
  { tab: "likes", icon: Heart, labelKey: "tabLikes" },
  { tab: "chat", icon: MessageCircle, labelKey: "tabChat" },
  { tab: "map", icon: MapPin, labelKey: "tabMap" },
]

export function DesktopAppNav() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const tabParam = searchParams.get("tab")
  const tab: AppTab =
    tabParam === "likes" || tabParam === "chat" || tabParam === "map" ? tabParam : "discover"

  const onApp = pathname === "/app"
  const onProfile = pathname === "/profile" || pathname.startsWith("/profile/")
  if (!onApp && !onProfile) return null

  return (
    <aside className="ttm-desktop-nav" aria-label="App navigation">
      <Link href="/" className="mb-4 opacity-90 hover:opacity-100 transition-opacity" aria-label="Time to Match">
        <Logo variant="icon" size="sm" />
      </Link>
      {ITEMS.map(({ tab: id, icon: Icon, labelKey }) => {
        const active = tab === id
        return (
          <Link
            key={id}
            href={id === "discover" ? "/app" : `/app?tab=${id}`}
            className={cn("ttm-desktop-nav__item", active && "ttm-desktop-nav__item--active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
      <div className="flex-1" aria-hidden />
      <Link
        href="/profile"
        className={cn("ttm-desktop-nav__item", onProfile && "ttm-desktop-nav__item--active")}
        aria-current={onProfile ? "page" : undefined}
      >
        <User className="w-5 h-5" strokeWidth={1.5} />
        <span>{t("tabProfile")}</span>
      </Link>
    </aside>
  )
}
