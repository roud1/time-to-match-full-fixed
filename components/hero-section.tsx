"use client"

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"
import { SyncHeroRing } from "@/components/sync/sync-hero-ring"
import { useHeroParallax } from "@/hooks/use-hero-parallax"
import { useHydrated } from "@/hooks/use-hydrated"
import { cn } from "@/lib/utils"

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
    transition: { duration: 0.85, ease: cinematicEase },
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
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 60])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.12])
  const { x: parallaxX, y: parallaxY } = useHeroParallax()
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const [tick, setTick] = useState(false)

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
        if (seconds % 10 === 0) setTick(true)
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!tick) return
    const id = setTimeout(() => setTick(false), 400)
    return () => clearTimeout(id)
  }, [tick])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-[5.5rem] sm:pt-28 pb-24 sm:pb-20 overflow-hidden bg-[#070707]"
    >
      <CinematicParticles count={10} />

      <motion.div
        className="absolute top-[18%] left-1/2 w-[min(100vw,720px)] h-[min(60vh,480px)] rounded-full opacity-30 pointer-events-none"
        style={{
          x: allowMotion ? parallaxX : 0,
          y: allowMotion ? parallaxY : 0,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, rgba(140,160,220,0.08) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={allowMotion ? { opacity: [0.25, 0.4, 0.25] } : undefined}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={allowMotion ? { y: headlineY, opacity: headlineOpacity } : undefined}
        className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_minmax(260px,340px)] gap-12 lg:gap-16 items-center"
      >
        <div className="text-center lg:text-left">
          <motion.div variants={item} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-extralight tracking-[0.22em] uppercase text-white/55 border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-white/40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white/70" />
              </span>
              {t("heroSyncBadge")}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extralight tracking-[-0.03em] leading-[1.04] mb-5 md:mb-7 text-balance"
          >
            <span className="block text-white/88 mb-2">{t("heroEmotionalLine1")}</span>
            <span className="block bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              {t("heroEmotionalLine2")}
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="text-base sm:text-lg text-white/45 font-extralight max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed tracking-wide"
          >
            {t("heroEmotionalSubtitle")}
          </motion.p>

          <motion.div variants={item} className="mb-6">
            <motion.div
              animate={tick && allowMotion ? { scale: [1, 1.01, 1] } : undefined}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              {[
                { value: timeLeft.hours, label: t("hours") },
                { value: timeLeft.minutes, label: t("minutes") },
                { value: timeLeft.seconds, label: t("seconds") },
              ].map((unit, index) => (
                <div key={unit.label} className="text-center">
                  <div
                    className={cn(
                      "rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md px-4 py-3 md:px-6 md:py-4 min-w-[68px] md:min-w-[92px]",
                      index === 2 && tick && "ring-1 ring-white/15"
                    )}
                  >
                    <span className="text-2xl sm:text-3xl md:text-4xl font-extralight tabular-nums text-white/92 tracking-tight">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-white/35 mt-2 block font-extralight uppercase tracking-[0.2em]">
                    {unit.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.p variants={item} className="text-[10px] text-white/30 font-extralight mb-8 tracking-[0.14em] uppercase">
            {t("heroMatchTimerHint")}
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-md lg:max-w-none mx-auto lg:mx-0"
          >
            <PremiumButton href="/register" className="w-full sm:w-auto min-h-[52px] text-base">
              {t("startSearch")}
            </PremiumButton>
            <PremiumButton href="/#how" variant="ghost" className="w-full sm:w-auto min-h-[52px]">
              {t("learnMore")}
            </PremiumButton>
          </motion.div>
        </div>

        <motion.div variants={item} className="flex justify-center lg:justify-end">
          <SyncHeroRing />
        </motion.div>
      </motion.div>
    </section>
  )
}
