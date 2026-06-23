"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronLeft, Settings } from "lucide-react"
import { BottomNavBar } from "@/client/components/app/bottom-nav-bar"
import { DesktopAppNav } from "@/client/components/layout/desktop-app-nav"
import { GeolocationBootstrap } from "@/client/components/geolocation-bootstrap"
import { LocationBanner } from "@/client/components/location-control"
import { ThemeToggle } from "@/client/components/theme/theme-toggle"
import { useDesktopAppNav } from "@/client/hooks/use-desktop-app-nav"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"
import "@/app/auth-shell.css"
import "@/app/profile-page.css"

type ProfilePageShellProps = {
  children: ReactNode
}

export function ProfilePageShell({ children }: ProfilePageShellProps) {
  const { t } = useI18n()
  const isDesktop = useDesktopAppNav()

  return (
    <div className={cn("ttm-profile-page ttm-brand-universe", isDesktop && "ttm-with-desktop-nav")}>
      <Suspense fallback={null}>
        <DesktopAppNav />
      </Suspense>
      <GeolocationBootstrap autoRequest />
      <LocationBanner className="ttm-location-banner--auth" />

      <header className="ttm-floating-header sticky top-0 z-40 shrink-0">
        <div className="ttm-profile-page__header-inner ttm-page">
          {!isDesktop ? (
            <Link href="/app" className="ttm-profile-page__back">
              <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden min-[380px]:inline">{t("profileBackToApp")}</span>
            </Link>
          ) : (
            <span className="w-[4.5rem] shrink-0" aria-hidden />
          )}
          <h1 className="ttm-profile-page__title">{t("profilePageTitle")}</h1>
          <div className="ttm-profile-page__actions">
            <ThemeToggle compact className="ttm-auth-nav__theme" />
            <Link
              href="/settings"
              className="ttm-auth-nav__theme inline-flex items-center justify-center"
              aria-label={t("settingsTitle")}
              title={t("settingsTitle")}
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </header>

      <main className="ttm-profile-page__main">
        <div className="ttm-profile-page__content">{children}</div>
      </main>

      {!isDesktop && <BottomNavBar active="profile" />}
    </div>
  )
}
