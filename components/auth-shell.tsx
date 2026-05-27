"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { LocationControl } from "@/components/location-control"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="ttm-auth-shell ttm-brand-universe min-h-[100dvh] flex flex-col">
      <header
        className="ttm-auth-shell__header relative z-50"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}
      >
        <div className="ttm-brand-glass mx-auto max-w-lg flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-2xl">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 ttm-brand-interactive min-w-0">
            <Logo />
            <span className="ttm-brand-overline text-[var(--text-secondary)] hidden min-[380px]:inline truncate">
              Time to Match
            </span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle compact />
            <LocationControl />
          </div>
        </div>
      </header>

      <main
        className="relative z-10 flex-1 flex items-start justify-center ttm-page py-6 sm:py-8 md:py-12 w-full min-h-0"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="w-full flex justify-center px-3 sm:px-4 md:px-6">{children}</div>
      </main>
    </div>
  )
}
