"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/client/lib/i18n"
import { Logo } from "@/client/components/logo"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { GlowButton } from "@/client/components/experience/primitives/glow-button"
import { NeonText } from "@/client/components/experience/primitives/neon-text"

export function ZoneCommit() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      router.push("/register")
      return
    }
    router.push(`/register?email=${encodeURIComponent(trimmed)}`)
  }

  return (
    <section className="xp-zone pb-[var(--xp-8)]" aria-labelledby="xp-commit-title">
      <GlassPanel depth={3} className="mx-auto max-w-lg p-[var(--xp-6)] sm:p-[var(--xp-7)]">
        <NeonText as="h2" id="xp-commit-title" variant="pink" className="text-2xl font-bold sm:text-3xl">
          {t("ttmXpCommitTitle")}
        </NeonText>
        <p className="mt-[var(--xp-3)] text-sm text-[var(--xp-text-muted)] sm:text-base">
          {t("ttmXpCommitSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-[var(--xp-5)] flex flex-col gap-[var(--xp-4)]">
          <label className="flex flex-col gap-[var(--xp-2)] text-sm">
            <span className="text-[var(--xp-text-muted)]">{t("ttmXpCommitEmail")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="rounded-[var(--xp-radius-md)] border border-white/12 bg-black/30 px-4 py-3 text-[var(--xp-text)] placeholder:text-[var(--xp-text-dim)] focus:border-[var(--xp-pink)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--xp-pink)]/25"
            />
          </label>
          <GlowButton type="submit" variant="pink" className="w-full">
            {t("ttmXpCommitStart")}
          </GlowButton>
        </form>

        <p className="mt-[var(--xp-4)] text-center text-xs text-[var(--xp-text-dim)]">
          <Link href="/login" className="text-[var(--xp-purple)] transition-colors hover:text-[var(--xp-pink)] hover:underline">
            {t("ttmXpCommitLogin")}
          </Link>
        </p>
      </GlassPanel>

      <footer className="xp-footer mt-[var(--xp-6)] flex flex-col items-center gap-[var(--xp-3)] text-center sm:mt-[var(--xp-7)]">
        <Logo variant="full" size="sm" theme="dark" showTagline className="opacity-90" />
        <p className="max-w-xs text-[0.65rem] leading-relaxed text-[var(--xp-text-dim)]">
          {t("ttmXpCommitSubtitle")}
        </p>
      </footer>
    </section>
  )
}
