"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { DatingAppMockup } from "@/client/components/landing/dating/dating-app-mockup"
import { DatingPulseLine } from "@/client/components/landing/dating/dating-pulse-line"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="ttm-dating-hero" aria-labelledby="dating-hero-title">
      <div className="ttm-dating-hero__ambient" aria-hidden>
        <div className="ttm-dating-hero__orb ttm-dating-hero__orb--purple" />
        <div className="ttm-dating-hero__orb ttm-dating-hero__orb--copper" />
        <div className="ttm-dating-hero__orb ttm-dating-hero__orb--blue" />
        <div className="ttm-dating-hero__vignette" />
      </div>

      <div className="ttm-dating-container ttm-dating-hero__grid">
        <div className="ttm-dating-hero__copy">
          <motion.p className="ttm-dating-hero__eyebrow" {...fade(0)}>
            Time to Match
          </motion.p>

          <motion.h1 id="dating-hero-title" className="ttm-dating-hero__title" {...fade(0.08)}>
            {t("datingHeroTitleLine1")}
            <span className="ttm-dating-hero__title-accent">{t("datingHeroTitleLine2")}</span>
          </motion.h1>

          <motion.p className="ttm-dating-hero__sub" {...fade(0.18)}>
            {t("datingHeroSub")}
          </motion.p>

          <motion.div className="ttm-dating-hero__actions" {...fade(0.28)}>
            <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero">
              <span className="ttm-dating-cta__shine" aria-hidden />
              {t("datingHeroCta")}
            </Link>
            <Link href="/login" className="ttm-dating-cta ttm-dating-cta--ghost">
              {t("login")}
            </Link>
          </motion.div>

          <motion.div {...fade(0.38)}>
            <DatingPulseLine />
          </motion.div>
        </div>

        <motion.div
          className="ttm-dating-hero__visual"
          initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <DatingAppMockup />
        </motion.div>
      </div>
    </section>
  )
}
