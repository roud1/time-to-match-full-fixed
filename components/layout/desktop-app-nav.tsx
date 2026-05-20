"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Compass, Heart, MapPin, MessageCircle, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { AppTab } from "@/components/app/bottom-nav"

const ITEMS: { tab: AppTab; icon: typeof Compass; labelKey: string }[] = [
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

  if (pathname !== "/app") return null

  return (
    <aside className="ttm-desktop-nav" aria-label="App navigation">
      <Link href="/" className="mb-4 opacity-90 hover:opacity-100 transition-opacity">
        <Logo size="sm" />
      </Link>
      {ITEMS.map(({ tab: id, icon: Icon, labelKey }) => {
        const active = tab === id
        return (
          <Link
            key={id}
            href={`/app?tab=${id}`}
            className={cn("ttm-desktop-nav__item", active && "ttm-desktop-nav__item--active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span>{t(labelKey)}</span>
          </Link>
        )
      })}
      <div className="flex-1" />
      <Link
        href="/profile"
        className={cn(
          "ttm-desktop-nav__item",
          pathname.startsWith("/profile") && "ttm-desktop-nav__item--active"
        )}
      >
        <User className="w-5 h-5" strokeWidth={1.5} />
        <span>{t("tabProfile")}</span>
      </Link>
    </aside>
  )
}
