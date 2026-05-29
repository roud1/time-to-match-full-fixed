"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { DatingProfileCard } from "@/components/landing/dating/dating-profile-card"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")
  const profiles = useDatingHeroProfiles()
  const profile = profiles[0]

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  if (!profile) return null

  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")}`
  const heroChips = [t("datingHeroChip1"), t("datingHeroChip2")]
  const supportProfiles = useMemo(
    () =>
      [
        {
          delta: 6,
          km: 4,
          imageUrl:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=420&h=520&fit=crop&q=85",
        },
        {
          delta: 12,
          km: 7,
          imageUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=420&h=520&fit=crop&q=85",
        },
        {
          delta: 18,
          km: 11,
          imageUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=420&h=520&fit=crop&q=85",
        },
      ].map(({ delta, km, imageUrl }, index) => ({
        ...profile,
        age: profile.age + index + 1,
        connectionScore: Math.max(62, profile.connectionScore - delta),
        distance: t("datingKmAway").replace("{km}", String(km)),
        imageUrl,
        verified: false,
      })),
    [profile, t]
  )

  return (
    <section className="ttm-dating-hero" aria-labelledby="dating-hero-title">
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
            <div className="ttm-dating-hero__card-cluster">
              <div className="ttm-dating-hero__card-aura" aria-hidden />
              <div className="ttm-dating-hero__cards-under" aria-hidden>
                {supportProfiles.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className={cn(
                      "ttm-dating-hero__cards-under-item",
                      index === 0 && "ttm-dating-hero__cards-under-item--left",
                      index === 1 && "ttm-dating-hero__cards-under-item--center",
                      index === 2 && "ttm-dating-hero__cards-under-item--right",
                      !reduce && "ttm-dating-hero__cards-under-item--active"
                    )}
                    style={{ animationDelay: `${index * 0.18}s` }}
                  >
                    <DatingProfileCard profile={item} className="ttm-dating-card--mini" />
                  </div>
                ))}
              </div>
              <div
                className={cn(
                  "ttm-dating-hero__card-float",
                  !reduce && "ttm-dating-hero__card-float--active"
                )}
              >
                <DatingProfileCard profile={profile} featured className="ttm-dating-card--scene" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
