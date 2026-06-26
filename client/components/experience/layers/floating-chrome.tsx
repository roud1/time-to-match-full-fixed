"use client"

import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import { NeonText } from "@/client/components/experience/primitives/neon-text"

export function ExperienceFloatingChrome() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-[clamp(1rem,4vw,1.5rem)] py-4 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        aria-hidden
      />
      <Link href="/" className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--xp-pink)] to-[var(--xp-purple)] text-xs font-black text-[#0b0b10]"
          aria-hidden
        >
          T
        </span>
        <NeonText as="span" variant="white" className="text-sm font-semibold sm:text-base">
          {t("ttmXpBrand")}
        </NeonText>
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-xs font-medium text-[var(--xp-text-muted)] transition-colors hover:text-[var(--xp-text)] sm:text-sm"
        >
          {t("ttmXpNavLogin")}
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-[var(--xp-pink)]/40 bg-[var(--xp-pink)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--xp-pink)] shadow-[var(--xp-glow-pink)] transition hover:bg-[var(--xp-pink)]/20 sm:px-4 sm:text-sm"
        >
          {t("register")}
        </Link>
      </nav>
    </header>
  )
}
