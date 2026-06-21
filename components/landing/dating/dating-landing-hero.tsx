"use client"

import Link from "next/link"
import { Heart, Sparkles } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DatingHeroAtmosphere } from "@/components/landing/dating/dating-hero-atmosphere"
import { DatingHeroFloats } from "@/components/landing/dating/dating-hero-floats"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useParallaxIntensity } from "@/hooks/use-parallax"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"

function useCountdownDisplay() {
  const [time, setTime] = useState("23:59:42")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(24, 0, 0, 0)
      const diff = Math.max(0, end.getTime() - now.getTime())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      )
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return time
}

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const intensity = useParallaxIntensity(1)
  const sectionRef = useRef<HTMLElement>(null)
  const [ctaHref, setCtaHref] = useState("/register")
  const profiles = useDatingHeroProfiles()
  const profile = profiles[1] ?? profiles[0]
  const countdown = useCountdownDisplay()
  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const heroY = useTransform(scrollY, [0, 500], [0, reduce ? 0 : -50 * intensity])
  const heroOpacity = useTransform(scrollY, [0, 420], [1, reduce ? 1 : 0.55])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -28 * intensity])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 18 * intensity])

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const heroChips = useMemo(() => [t("datingHeroChip1"), t("datingHeroChip2")], [t])

  if (!profile) return null

  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")}`

  return (
    <section
      ref={sectionRef}
      className="ttm-dating-hero ttm-dating-hero--cinematic"
      aria-labelledby="dating-hero-title"
    >
      <DatingHeroAtmosphere />
      <DatingHeroFloats />

      <motion.div
        className="ttm-dating-hero__content"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="ttm-dating-container">
          <div className="ttm-dating-hero__grid">
            <motion.div
              className="ttm-dating-hero__copy"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="ttm-dating-hero__eyebrow">
                <Sparkles size={14} aria-hidden />
                {t("datingHeroEyebrow")}
              </p>

              <motion.h1
                id="dating-hero-title"
                className="ttm-dating-hero__title"
                aria-label={titleFull}
                style={{ y: titleY }}
              >
                <span className="ttm-dating-hero__title-line">{t("datingHeroTitleLine1")}</span>
                <span className="ttm-dating-hero__title-line ttm-dating-hero__title-line--accent">
                  {t("datingHeroTitleLine2")}
                </span>
              </motion.h1>

              <p className="ttm-dating-hero__sub">{t("datingHeroSub")}</p>

              <div className="ttm-dating-hero__actions">
                <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero ttm-dating-cta--pulse">
                  <span className="ttm-dating-cta__ring" aria-hidden />
                  {t("datingHeroCta")}
                </Link>
                <Link href="/login" className="ttm-dating-cta ttm-dating-cta--ghost">
                  {t("login")}
                </Link>
              </div>

              <ul className="ttm-dating-hero__chips" aria-label={t("datingHeroChipsAria")}>
                {heroChips.map((chip) => (
                  <li key={chip} className="ttm-dating-hero__chip">
                    {chip}
                  </li>
                ))}
              </ul>
            </motion.div>

            <DatingParallaxLayer y={visualY} className="ttm-dating-hero__visual">
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                aria-label={t("datingHeroCardsAria")}
              >
              <div className="ttm-dating-hero__timer-card">
                <span className="ttm-dating-hero__timer-label">{t("datingHow3Title")}</span>
                <span className="ttm-dating-hero__timer" aria-live="polite">
                  {countdown}
                </span>
                <p className="ttm-dating-hero__timer-caption">{t("datingHeroTime")}</p>
              </div>

              <div className="ttm-dating-hero__spark-card">
                <span className="ttm-dating-hero__spark-icon" aria-hidden>
                  <Heart size={20} fill="currentColor" />
                </span>
                <p className="ttm-dating-hero__spark-score">{profile.connectionScore}%</p>
                <p className="ttm-dating-hero__spark-label">{t("datingAiOutputLabel")}</p>
                <p className="ttm-dating-hero__spark-name">
                  {profile.name}, {profile.age}
                </p>
              </div>
              </motion.div>
            </DatingParallaxLayer>
          </div>
        </div>
      </motion.div>

      <div className="ttm-dating-hero__scroll-hint" aria-hidden>
        <span className="ttm-dating-hero__scroll-dot" />
      </div>
    </section>
  )
}
