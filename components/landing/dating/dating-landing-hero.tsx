"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { DatingHeroAtmosphere } from "@/components/landing/dating/dating-hero-atmosphere"
import { DatingHeroFloats } from "@/components/landing/dating/dating-hero-floats"
import { DatingHeroMatchPreview } from "@/components/landing/dating/dating-hero-match-preview"
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

const STAGGER = {
  eyebrow: 0,
  title1: 0.08,
  title2: 0.16,
  sub: 0.24,
  actions: 0.32,
  chips: 0.4,
} as const

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const intensity = useParallaxIntensity(1)
  const sectionRef = useRef<HTMLElement>(null)
  const [ctaHref, setCtaHref] = useState("/register")
  const countdown = useCountdownDisplay()

  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const contentY = useTransform(scrollY, [0, 480], [0, reduce ? 0 : -60 * intensity])
  const contentScale = useTransform(scrollYProgress, [0, 0.55], [1, reduce ? 1 : 0.96])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.45])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -22 * intensity])
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const heroChips = useMemo(() => [t("datingHeroChip1"), t("datingHeroChip2")], [t])
  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")}`

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section
      ref={sectionRef}
      className="ttm-dating-hero ttm-dating-hero--cinematic"
      aria-labelledby="dating-hero-title"
    >
      <DatingHeroAtmosphere scrollProgress={scrollYProgress} />
      <DatingHeroFloats scrollProgress={scrollYProgress} />

      <motion.div
        className="ttm-dating-hero__content"
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
      >
        <div className="ttm-dating-container">
          <div className="ttm-dating-hero__grid">
            <motion.div className="ttm-dating-hero__copy" style={{ y: copyY }}>
              <motion.p className="ttm-dating-hero__eyebrow" {...fadeUp(STAGGER.eyebrow)}>
                <Sparkles size={14} aria-hidden />
                {t("datingHeroEyebrow")}
              </motion.p>

              <motion.h1
                id="dating-hero-title"
                className="ttm-dating-hero__title"
                aria-label={titleFull}
                {...fadeUp(STAGGER.title1)}
              >
                <motion.span
                  className="ttm-dating-hero__title-line"
                  {...fadeUp(STAGGER.title1)}
                >
                  {t("datingHeroTitleLine1")}
                </motion.span>
                <motion.span
                  className="ttm-dating-hero__title-line ttm-dating-hero__title-line--accent"
                  {...fadeUp(STAGGER.title2)}
                >
                  {t("datingHeroTitleLine2")}
                </motion.span>
              </motion.h1>

              <motion.p className="ttm-dating-hero__sub" {...fadeUp(STAGGER.sub)}>
                {t("datingHeroSub")}
              </motion.p>

              <motion.div className="ttm-dating-hero__actions" {...fadeUp(STAGGER.actions)}>
                <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero ttm-dating-cta--pulse">
                  <span className="ttm-dating-cta__ring" aria-hidden />
                  {t("datingHeroCta")}
                </Link>
                <Link href="/login" className="ttm-dating-cta ttm-dating-cta--ghost">
                  {t("login")}
                </Link>
              </motion.div>

              <motion.ul
                className="ttm-dating-hero__chips"
                aria-label={t("datingHeroChipsAria")}
                {...fadeUp(STAGGER.chips)}
              >
                {heroChips.map((chip) => (
                  <li key={chip} className="ttm-dating-hero__chip">
                    {chip}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <div className="ttm-dating-hero__visual">
              <DatingHeroMatchPreview countdown={countdown} scrollProgress={scrollYProgress} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="ttm-dating-hero__scroll-hint"
        aria-hidden
        style={{ opacity: scrollHintOpacity }}
      >
        <span className="ttm-dating-hero__scroll-dot" />
      </motion.div>
    </section>
  )
}
