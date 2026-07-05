"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"
import { GlowButton } from "@/client/components/experience/primitives/glow-button"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { ZoneGlow } from "@/client/components/experience/primitives/zone-glow"

const STATS = [
  { key: "ttmXpHeroStat1", accent: "green" },
  { key: "ttmXpHeroStat2", accent: "pink" },
  { key: "ttmXpHeroStat3", accent: "purple" },
] as const

const ACCENT_DOT = {
  green: "bg-[var(--xp-green)] shadow-[0_0_8px_rgba(0,255,163,0.6)]",
  pink: "bg-[var(--xp-pink)] shadow-[0_0_8px_rgba(255,46,99,0.6)]",
  purple: "bg-[var(--xp-purple)] shadow-[0_0_8px_rgba(108,92,231,0.6)]",
} as const

export function ZoneHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section className="xp-zone xp-hero" aria-labelledby="xp-hero-title">
      <ZoneGlow variant="purple" position="top-left" size="lg" />
      <ZoneGlow variant="pink" position="bottom-right" size="md" />

      <motion.div
        className="xp-hero__inner"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="xp-label xp-hero__eyebrow">{t("ttmXpBrand")}</p>

        <h1 id="xp-hero-title" className="xp-hero__headline">
          {/* Line 1 — gradient: the hero statement */}
          <span
            className="block"
            style={{
              background: "var(--xp-gradient-text)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 0 32px rgba(247,37,133,0.35))",
            }}
          >
            {t("ttmXpHeroHeadline1")}
          </span>
          {/* Line 2 — white, slightly dimmed */}
          <NeonText as="span" variant="white" className="block opacity-90">
            {t("ttmXpHeroHeadline2")}
          </NeonText>
          {/* Line 3 — pink accent, smaller visual weight */}
          <NeonText as="span" variant="pink" className="block text-[0.82em]">
            {t("ttmXpHeroHeadline3")}
          </NeonText>
        </h1>

        <p className="xp-hero__subtitle">{t("ttmXpHeroSubtitle")}</p>

        <div className="xp-hero__actions">
          <GlowButton href="/register">{t("ttmXpHeroCtaStart")}</GlowButton>
          <GlowButton href="#xp-immersion" variant="ghost">
            {t("ttmXpHeroCtaHow")}
          </GlowButton>
        </div>

        <ul className="xp-hero__stats" aria-label={t("ttmXpHeroStatsLabel")}>
          {STATS.map(({ key, accent }) => (
            <li key={key} className="xp-hero__stat">
              <span className={`xp-hero__stat-dot ${ACCENT_DOT[accent]}`} aria-hidden />
              {t(key)}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
