"use client"

import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import { Logo } from "@/client/components/logo"
import { LanguageSwitcher } from "@/client/components/language-switcher"

export function ExperienceFloatingChrome() {
  const { t } = useI18n()

  return (
    <header className="xp-header sticky top-0 z-40 flex items-center justify-between px-[clamp(1rem,4vw,1.5rem)] py-3 backdrop-blur-xl sm:py-4">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden
      />
      <Link
        href="/"
        className="group flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--xp-purple)]/40"
      >
        <span className="shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]">
          <Logo variant="full" size="sm" theme="dark" className="hidden sm:inline-flex" />
          <Logo variant="icon" size="sm" theme="dark" className="sm:hidden" />
        </span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher embedded />
        <Link
          href="/login"
          className="hidden text-xs font-medium text-[var(--xp-text-muted)] transition-colors hover:text-[var(--xp-text)] min-[400px]:inline sm:text-sm"
        >
          {t("ttmXpNavLogin")}
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-[var(--xp-pink)]/40 bg-[var(--xp-pink)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--xp-pink)] shadow-[var(--xp-glow-pink)] transition hover:bg-[var(--xp-pink)]/20 sm:px-4 sm:py-2 sm:text-sm"
        >
          {t("register")}
        </Link>
      </nav>
    </header>
  )
}
