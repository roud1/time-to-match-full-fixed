"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { DatingParallaxBg } from "@/components/landing/dating/dating-parallax-bg"
import { DatingProfileCard } from "@/components/landing/dating/dating-profile-card"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")
  const profile = useDatingHeroProfiles()[0]

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  if (!profile) return null

  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")}`
  const heroChips = [t("datingHeroChip1"), t("datingHeroChip2")]

  return (
    <section className="ttm-dating-hero" aria-labelledby="dating-hero-title">
      <DatingParallaxBg className="ttm-dating-hero__parallax" />

      <div className="ttm-dating-container">
        <motion.div
          className="ttm-dating-hero__scene"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-dating-hero__scene-glow" aria-hidden />
          <div className="ttm-dating-hero__bridge" aria-hidden />

          <div className="ttm-dating-hero__copy">
            <p className="ttm-dating-hero__eyebrow">{t("datingHeroEyebrow")}</p>

            <h1 id="dating-hero-title" className="ttm-dating-hero__title" aria-label={titleFull}>
              <span className="ttm-dating-hero__title-line">{t("datingHeroTitleLine1")}</span>
              <span className="ttm-dating-hero__title-line ttm-dating-hero__title-line--soft">
                {t("datingHeroTitleLine2")}
              </span>
            </h1>

            <div className="ttm-dating-hero__actions">
              <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero ttm-dating-cta--pulse">
                <span className="ttm-dating-cta__shine" aria-hidden />
                {t("datingHeroCta")}
              </Link>
            </div>

            <p className="ttm-dating-hero__sub">{t("datingHeroSub")}</p>
            <p className="ttm-dating-hero__time">{t("datingHeroTime")}</p>
            <ul className="ttm-dating-hero__chips" aria-label={t("datingHeroChipsAria")}>
              {heroChips.map((chip) => (
                <li key={chip} className="ttm-dating-hero__chip">
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            className="ttm-dating-hero__visual"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            aria-label={t("datingHeroCardsAria")}
          >
            <div className="ttm-dating-hero__card-aura" aria-hidden />
            <div
              className={cn(
                "ttm-dating-hero__card-float",
                !reduce && "ttm-dating-hero__card-float--active"
              )}
            >
              <DatingProfileCard profile={profile} featured className="ttm-dating-card--scene" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
