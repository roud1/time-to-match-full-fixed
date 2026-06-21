"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { GeolocationBootstrap } from "@/components/geolocation-bootstrap"
import { LocationBanner, LocationControl } from "@/components/location-control"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import "@/app/auth-shell.css"

export function AuthShell({ children }: { children: ReactNode }) {
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
        <div className="ttm-auth-shell__content">{children}</div>
      </main>
    </div>
  )
}
