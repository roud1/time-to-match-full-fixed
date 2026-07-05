"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/client/components/logo"
import { GeolocationBootstrap } from "@/client/components/geolocation-bootstrap"
import { LocationBanner, LocationControl } from "@/client/components/location-control"
import { ThemeToggle } from "@/client/components/theme/theme-toggle"
import { useI18n } from "@/client/lib/i18n"
import "@/app/auth-shell.css"
import "@/app/auth-login.css"

function AuthPanelPitch() {
  const { t } = useI18n()
  const chips = [t("datingHeroChip1"), t("datingHeroChip2"), t("datingHow3Title")]

  return (
    <>
      <p className="ttm-auth-shell__panel-eyebrow">{t("datingHeroEyebrow")}</p>
      <h2 className="ttm-auth-shell__panel-title">
        <span>{t("datingHeroTitleLine1")}</span>
        <span className="ttm-auth-shell__panel-title-soft">{t("datingHeroTitleLine2")}</span>
      </h2>
      <ul className="ttm-auth-shell__panel-chips" aria-label={t("datingHeroChipsAria")}>
        {chips.map((chip) => (
          <li key={chip} className="ttm-auth-shell__panel-chip">
            {chip}
          </li>
        ))}
      </ul>
      <blockquote className="ttm-auth-shell__panel-quote">{t("datingEmotional3")}</blockquote>
    </>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="ttm-auth-shell ttm-brand-universe">
      <GeolocationBootstrap />
      <LocationBanner className="ttm-location-banner--auth" />
      <header className="ttm-auth-nav">
        <nav className="ttm-auth-nav__inner" aria-label="Main">
          <Link href="/" className="ttm-auth-nav__brand">
            <Logo variant="full" size="sm" className="hidden sm:inline-flex" />
            <Logo variant="icon" size="sm" className="sm:hidden" />
          </Link>
          <div className="ttm-auth-nav__actions">
            {/* ThemeToggle removed from auth — dark only, no distraction */}
          </div>
        </nav>
      </header>

      <main className="ttm-auth-shell__main">
        <aside className="ttm-auth-shell__panel" aria-hidden>
          <div className="ttm-auth-shell__panel-glow" aria-hidden />
          <div className="ttm-auth-shell__panel-inner">
            <AuthPanelPitch />
          </div>
        </aside>

        <div className="ttm-auth-shell__content-wrap">
          <div className="ttm-auth-shell__mobile-pitch" aria-hidden>
            <AuthPanelPitch />
          </div>
          <div className="ttm-auth-shell__content">{children}</div>
        </div>
      </main>
    </div>
  )
}
