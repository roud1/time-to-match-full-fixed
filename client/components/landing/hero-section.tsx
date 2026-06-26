"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { AnimatedSwipeCards } from "@/client/components/landing/animated-swipe-cards"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

function useCountdown() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const now = Date.now()
  const endOfDay = new Date()
  endOfDay.setHours(24, 0, 0, 0)
  const diff = Math.max(0, Math.floor((endOfDay.getTime() - now) / 1000))

  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    progress: diff / 86400,
    tick,
  }
}

function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="ttm-hero-particle"
      style={{ left: `${x}%`, width: size, height: size }}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.7, 0.7, 0], y: [0, -500] }}
      transition={{ duration: 8 + (x % 6), delay, repeat: Infinity, ease: "linear" }}
      aria-hidden
    />
  )
}

export function HeroSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")
  const countdown = useCountdown()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
    setMounted(true)
  }, [])

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    x: (i * 37 + 11) % 100,
    size: 2 + (i % 4),
  }))

  return (
    <section className="ttm-hero" aria-labelledby="hero-title">
      <div className="ttm-hero__bg" aria-hidden>
        <div className="ttm-hero__gradient" />
        <div className="ttm-hero__mesh" />
        <div className="ttm-hero__vignette" />
        {particles.map((p) => (
          <Particle key={p.id} delay={p.delay} x={p.x} size={p.size} />
        ))}
      </div>

      <div className="ttm-container ttm-hero__content">
        <div className="ttm-hero__text">
          <motion.div
            className="ttm-hero__badge"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="ttm-hero__badge-dot" />
            {t("ttmLandingHeroEyebrow")}
          </motion.div>

          <h1 id="hero-title" className="ttm-hero__title">
            <motion.span
              className="ttm-hero__title-word"
              initial={reduce ? false : { opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("ttmLandingHeroTitle")}{" "}
            </motion.span>
            <motion.span
              className="ttm-hero__title-word"
              initial={reduce ? false : { opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("ttmLandingHeroTitleLine2")}{" "}
            </motion.span>
            <motion.span
              className="ttm-hero__title-accent"
              initial={reduce ? false : { opacity: 0, y: 40, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("ttmLandingHeroTitleAccent")}
            </motion.span>
          </h1>

          <motion.p
            className="ttm-hero__sub"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("ttmLandingHeroSub")}
          </motion.p>

          <motion.div
            className="ttm-hero__countdown"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-hero__countdown-label">{t("ttmLandingHeroCountdownLabel")}</div>
            <div className="ttm-hero__countdown-digits">
              {mounted ? (
                <>
                  <div className="ttm-hero__countdown-unit">
                    <motion.span
                      key={`h-${countdown.hours}`}
                      className="ttm-hero__countdown-num"
                      initial={{ opacity: 0.6, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {countdown.hours}
                    </motion.span>
                    <span className="ttm-hero__countdown-tag">{t("ttmLandingHeroCountdownH")}</span>
                  </div>
                  <span className="ttm-hero__countdown-sep">:</span>
                  <div className="ttm-hero__countdown-unit">
                    <motion.span
                      key={`m-${countdown.minutes}`}
                      className="ttm-hero__countdown-num"
                      initial={{ opacity: 0.6, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {countdown.minutes}
                    </motion.span>
                    <span className="ttm-hero__countdown-tag">{t("ttmLandingHeroCountdownM")}</span>
                  </div>
                  <span className="ttm-hero__countdown-sep">:</span>
                  <div className="ttm-hero__countdown-unit">
                    <motion.span
                      key={`s-${countdown.seconds}`}
                      className="ttm-hero__countdown-num ttm-hero__countdown-num--urgent"
                      initial={{ opacity: 0.6, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {countdown.seconds}
                    </motion.span>
                    <span className="ttm-hero__countdown-tag">{t("ttmLandingHeroCountdownS")}</span>
                  </div>
                </>
              ) : (
                <div className="ttm-hero__countdown-unit">
                  <span className="ttm-hero__countdown-num">24</span>
                  <span className="ttm-hero__countdown-tag">{t("ttmLandingHeroCountdownH")}</span>
                </div>
              )}
            </div>
            <div className="ttm-hero__countdown-bar">
              <motion.div
                className="ttm-hero__countdown-bar-fill"
                animate={mounted ? { scaleX: countdown.progress } : { scaleX: 1 }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
            </div>
          </motion.div>

          <motion.div
            className="ttm-hero__actions"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={ctaHref} className="ttm-hero__cta">
              <span className="ttm-hero__cta-text">{t("ttmLandingHeroCtaPrimary")}</span>
              <span className="ttm-hero__cta-glow" aria-hidden />
            </Link>
            <a href="#how-it-works" className="ttm-hero__cta-secondary">
              {t("ttmLandingHeroCtaSecondary")}
            </a>
          </motion.div>

          <motion.div
            className="ttm-hero__proof"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            <div className="ttm-hero__proof-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`ttm-hero__proof-avatar ttm-hero__proof-avatar--${i}`} />
              ))}
            </div>
            <span className="ttm-hero__proof-text">{t("ttmLandingHeroSocialProof")}</span>
          </motion.div>
        </div>

        <motion.div
          className="ttm-hero__visual"
          initial={reduce ? false : { opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ttm-hero__card-glow" aria-hidden />
          <AnimatedSwipeCards />
        </motion.div>
      </div>

      <motion.div
        className="ttm-hero__scroll"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        aria-hidden
      >
        <div className="ttm-hero__scroll-line" />
      </motion.div>
    </section>
  )
}
