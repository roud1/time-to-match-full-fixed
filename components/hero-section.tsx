"use client"

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"
import { useHeroParallax } from "@/hooks/use-hero-parallax"
import { useHydrated } from "@/hooks/use-hydrated"
import { SyncHeroRing } from "@/components/sync/sync-hero-ring"
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const cinematicEase = [0.22, 1, 0.36, 1] as const

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: cinematicEase },
  },
}

export function HeroSection() {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const reduceMotion = useReducedMotion()
  const allowMotion = hydrated && !reduceMotion
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 48])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.12])
  const { x: parallaxX, y: parallaxY } = useHeroParallax()
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative min-h-[100dvh] flex flex-col justify-center px-5 sm:px-8 pt-24 sm:pt-28 pb-20 sm:pb-24 overflow-hidden cin-hero-bg"
    >
      <div className="absolute inset-0 cin-gradient-shift opacity-40 pointer-events-none" aria-hidden />
      <div
        className="absolute top-[18%] left-1/2 w-[min(100vw,720px)] h-[min(65vh,480px)] -translate-x-1/2 -translate-y-1/2 cin-hero-glow pointer-events-none"
        aria-hidden
      />

      <CinematicParticles count={10} />

      <motion.div
        className="absolute top-[22%] left-1/2 w-[min(90vw,520px)] h-[min(50vh,320px)] rounded-full pointer-events-none"
        style={{
          x: allowMotion ? parallaxX : 0,
          y: allowMotion ? parallaxY : 0,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={allowMotion ? { opacity: [0.15, 0.28, 0.15] } : undefined}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(200,210,255,0.07) 0%, transparent 72%)",
            filter: "blur(56px)",
          }}
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={allowMotion ? { y: headlineY, opacity: headlineOpacity } : undefined}
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left order-1">
            <motion.div variants={item} className="mb-6 md:mb-8 flex justify-center lg:justify-start">
              <span className="ttm-cin-overline inline-flex items-center gap-2.5 px-4 py-2 rounded-full cin-glass">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-white/35" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/70" />
                </span>
                {t("heroSyncBadge")}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="ttm-cin-display text-balance mb-4 md:mb-6 cin-headline-glow"
            >
              <span className="block text-white/90 mb-1 md:mb-2">{t("heroConnectionLine1")}</span>
              <span className="block bg-gradient-to-b from-white via-white/92 to-white/55 bg-clip-text text-transparent">
                {t("heroConnectionLine2")}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="ttm-cin-sub max-w-lg mx-auto lg:mx-0 mb-8 md:mb-9 px-1 lg:px-0"
            >
              {t("heroConnectionSubtitle")}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 mb-8 md:mb-10"
            >
              <PremiumButton href="/register" className="w-full sm:w-auto min-h-[52px] text-[15px]">
                {t("startSearch")}
              </PremiumButton>
              <PremiumButton href="/#how" variant="ghost" className="w-full sm:w-auto min-h-[52px]">
                {t("learnMore")}
              </PremiumButton>
            </motion.div>

            <motion.div
              variants={item}
              className="inline-flex flex-col items-center lg:items-start gap-3"
            >
              <p className="ttm-cin-overline opacity-70">{t("heroLiveTimerLabel")}</p>
              <div className="inline-flex items-center gap-2 sm:gap-3">
                {[
                  { value: timeLeft.hours, label: t("hours") },
                  { value: timeLeft.minutes, label: t("minutes") },
                  { value: timeLeft.seconds, label: t("seconds") },
                ].map((unit) => (
                  <div key={unit.label} className="text-center">
                    <div className="cin-timer-block px-3 py-2.5 sm:px-4 sm:py-3 min-w-[64px] sm:min-w-[76px]">
                      <span className="text-2xl sm:text-3xl font-extralight tabular-nums text-white/90 tracking-tight">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="ttm-cin-overline mt-1.5 block opacity-55 text-[9px]">{unit.label}</span>
                  </div>
                ))}
              </div>
              <p className="ttm-cin-overline opacity-45 text-[9px] max-w-xs text-center lg:text-left">
                {t("heroMatchTimerHint")}
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            className="flex justify-center lg:justify-end order-2 lg:max-w-[300px] w-full mx-auto"
          >
            <SyncHeroRing className="scale-90 sm:scale-100" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
