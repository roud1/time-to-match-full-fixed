"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { useDatingHeroProfiles } from "@/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"

export function DatingLandingHero() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")
  const profiles = useDatingHeroProfiles()
  const profile = profiles[0]

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const heroChips = useMemo(() => [t("datingHeroChip1"), t("datingHeroChip2")], [t])

  if (!profile) return null

  const titleFull = `${t("datingHeroTitleLine1")} ${t("datingHeroTitleLine2")}`

  return (
    <section className="ttm-dating-hero" aria-labelledby="dating-hero-title">
      <div className="ttm-dating-container">
        <motion.div
          className="ttm-dating-hero__grid"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-dating-hero__copy">
            <p className="ttm-dating-hero__eyebrow">{t("datingHeroEyebrow")}</p>

            <h1 id="dating-hero-title" className="ttm-dating-hero__title" aria-label={titleFull}>
              <span className="ttm-dating-hero__title-line">{t("datingHeroTitleLine1")}</span>
              <span className="ttm-dating-hero__title-line ttm-dating-hero__title-line--accent">
                {t("datingHeroTitleLine2")}
              </span>
            </h1>

            <p className="ttm-dating-hero__sub">{t("datingHeroSub")}</p>

            <div className="ttm-dating-hero__actions">
              <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero">
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

            <div className="ttm-dating-hero__stats" aria-hidden>
              <div className="ttm-dating-hero__stat">
                <span className="ttm-dating-hero__stat-value">24h</span>
                <span className="ttm-dating-hero__stat-label">{t("datingHow3Title")}</span>
              </div>
              <div className="ttm-dating-hero__stat">
                <span className="ttm-dating-hero__stat-value">AI</span>
                <span className="ttm-dating-hero__stat-label">{t("datingNavAi")}</span>
              </div>
              <div className="ttm-dating-hero__stat">
                <span className="ttm-dating-hero__stat-value">1×</span>
                <span className="ttm-dating-hero__stat-label">{t("datingHeroChip1")}</span>
              </div>
            </div>
          </div>

          <motion.div
            className="ttm-dating-hero__bento"
            aria-label={t("datingHeroCardsAria")}
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-bento-cell ttm-dating-bento-cell--timer">
              <span className="ttm-dating-bento-timer-label">{t("datingHow3Title")}</span>
              <span className="ttm-dating-bento-timer">23:59</span>
              <p className="ttm-dating-bento-timer-label">{t("datingHeroTime")}</p>
            </div>

            <div className="ttm-dating-bento-cell ttm-dating-bento-cell--profile">
              <div className="ttm-dating-bento-profile">
                <Image
                  src={profile.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                <div className="ttm-dating-bento-profile__overlay">
                  <p className="ttm-dating-bento-profile__name">
                    {profile.name}, {profile.age}
                  </p>
                  <p className="ttm-dating-bento-profile__meta">{profile.distance}</p>
                </div>
              </div>
            </div>

            <div className="ttm-dating-bento-cell ttm-dating-bento-cell--score">
              <span className="ttm-dating-bento-score">{profile.connectionScore}%</span>
              <span className="ttm-dating-bento-score-label">{t("datingAiOutputLabel")}</span>
            </div>

            <div className="ttm-dating-bento-cell ttm-dating-bento-cell--signal">
              <p className="ttm-dating-bento-signal">
                <strong>{t("datingAiWeAnalyze")}</strong>
                {t("datingAiSignal1")} · {t("datingAiSignal2")}
              </p>
            </div>

            <div className="ttm-dating-bento-cell ttm-dating-bento-cell--cta">
              <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--sm">
                {t("datingNavStartMatching")}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
