"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { GeolocationBootstrap } from "@/components/geolocation-bootstrap"
import { LocationBanner, LocationControl } from "@/components/location-control"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useI18n } from "@/lib/i18n"
import "@/app/auth-shell.css"

export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n()

  return (
    <div className="ttm-auth-shell ttm-brand-universe">
      <GeolocationBootstrap />
      <LocationBanner className="ttm-location-banner--auth" />
      <header className="ttm-auth-nav">
        <nav className="ttm-auth-nav__inner" aria-label="Main">
          <Link href="/" className="ttm-auth-nav__brand">
            <Logo />
            <span>Time to Match</span>
          </Link>
          <div className="ttm-auth-nav__actions">
            <ThemeToggle compact className="ttm-auth-nav__theme" />
            <LocationControl />
          </div>
        </nav>
      </header>

      <main className="ttm-auth-shell__main">
        <aside className="ttm-auth-shell__panel" aria-hidden>
          <div className="ttm-auth-shell__panel-grid">
            <div className="ttm-auth-shell__panel-cell">
              <p className="ttm-auth-shell__panel-stat">24h</p>
              <p className="ttm-auth-shell__panel-label">{t("datingHow3Title")}</p>
            </div>
            <div className="ttm-auth-shell__panel-cell">
              <p className="ttm-auth-shell__panel-stat">AI</p>
              <p className="ttm-auth-shell__panel-label">{t("datingNavAi")}</p>
            </div>
            <div className="ttm-auth-shell__panel-cell ttm-auth-shell__panel-cell--wide">
              <p className="ttm-auth-shell__panel-stat">1×</p>
              <p className="ttm-auth-shell__panel-label">{t("datingHeroChip1")}</p>
            </div>
          </div>
          <blockquote className="ttm-auth-shell__panel-quote">
            {t("datingEmotional3")}
          </blockquote>
        </aside>

        <div className="ttm-auth-shell__content-wrap">
          <div className="ttm-auth-shell__content">{children}</div>
        </div>
      </main>
    </div>
  )
}
