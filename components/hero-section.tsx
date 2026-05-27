"use client"

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { useRef } from "react"
import { useI18n } from "@/lib/i18n"
import { PremiumButton } from "@/components/ui/premium-button"
import { useHeroParallax } from "@/hooks/use-hero-parallax"
import { useHydrated } from "@/hooks/use-hydrated"
import { LandingAmbient } from "@/components/landing/landing-ambient"
import { LiveConnectionVisual } from "@/components/landing/live-connection-visual"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
}

const cinematicEase = [0.22, 1, 0.36, 1] as const

const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.95, ease: cinematicEase },
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
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 40])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15])
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -24])
  const { x: parallaxX, y: parallaxY } = useHeroParallax()

  return (
    <section
      ref={sectionRef}
      id="top"
      className="landing-hero relative min-h-[100dvh] flex flex-col justify-center px-5 sm:px-8 pt-28 sm:pt-32 pb-20 sm:pb-28 overflow-hidden"
    >
      <LandingAmbient />
      <div className="landing-hero__glow-core" aria-hidden />

      <motion.div
        className="absolute top-[20%] right-[8%] w-48 h-48 rounded-full pointer-events-none opacity-30 hidden lg:block"
        style={{
          x: allowMotion ? parallaxX : 0,
          y: allowMotion ? parallaxY : 0,
        }}
        animate={allowMotion ? { opacity: [0.2, 0.35, 0.2] } : undefined}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(45,212,191,0.18), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <motion.div
            style={allowMotion ? { y: headlineY, opacity: headlineOpacity } : undefined}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div variants={item} className="mb-7 md:mb-8 flex justify-center lg:justify-start">
              <span className="ttm-cin-overline inline-flex items-center gap-2.5 px-4 py-2 rounded-full cin-glass">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-primary/25" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                {t("heroSyncBadge")}
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="ttm-cin-display text-balance mb-5 md:mb-7 text-foreground"
            >
              <span className="block text-foreground mb-1 md:mb-2">{t("heroConnectionLine1")}</span>
              <span className="block ttm-hero-accent-line">{t("heroConnectionLine2")}</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="ttm-cin-sub max-w-md mx-auto lg:mx-0 mb-3 px-1 lg:px-0 text-muted-foreground"
            >
              {t("landingHeroTagline")}
            </motion.p>

            <motion.p
              variants={item}
              className="text-sm font-normal text-muted-foreground max-w-md mx-auto lg:mx-0 mb-9 md:mb-10 leading-relaxed px-1 lg:px-0"
            >
              {t("heroConnectionSubtitle")}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3"
            >
              <PremiumButton href="/register" className="w-full sm:w-auto min-h-[52px] text-[15px]">
                {t("startSearch")}
              </PremiumButton>
              <PremiumButton href="/#evolution" variant="ghost" className="w-full sm:w-auto min-h-[52px]">
                {t("learnMore")}
              </PremiumButton>
            </motion.div>
          </motion.div>

          <motion.div
            variants={item}
            style={allowMotion ? { y: visualY } : undefined}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <LiveConnectionVisual />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
