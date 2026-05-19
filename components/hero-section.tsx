"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"
import { useHeroParallax } from "@/hooks/use-hero-parallax"
import { cn } from "@/lib/utils"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HeroSection() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15])
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const { x: parallaxX, y: parallaxY } = useHeroParallax()
  const parallaxXNeg = useTransform(parallaxX, (v) => v * -0.6)
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 59, seconds: 59 })
  const [pulse, setPulse] = useState(false)

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
          hours = 71
          minutes = 59
          seconds = 59
        }
        if (seconds % 10 === 0) setPulse(true)
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!pulse) return
    const id = setTimeout(() => setPulse(false), 400)
    return () => clearTimeout(id)
  }, [pulse])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 pt-[5.5rem] sm:pt-28 pb-24 sm:pb-20 overflow-hidden"
    >
      <CinematicParticles count={36} />

      {/* Ambient layers */}
      <motion.div
        className="absolute top-[28%] left-1/2 w-[min(110vw,880px)] h-[min(70vh,520px)] rounded-full opacity-50 pointer-events-none"
        style={{
          x: reduceMotion ? 0 : parallaxX,
          y: reduceMotion ? 0 : parallaxY,
          scale: reduceMotion ? 1 : glowScale,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(ellipse, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.18) 42%, transparent 68%)",
          filter: "blur(72px)",
        }}
        animate={reduceMotion ? undefined : { opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[15%] right-[5%] w-[min(60vw,400px)] h-[280px] rounded-full opacity-30 pointer-events-none hidden sm:block"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
          x: reduceMotion ? 0 : parallaxXNeg,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={reduceMotion ? undefined : { y: headlineY, opacity: headlineOpacity }}
        className="relative z-10 text-center max-w-6xl mx-auto w-full"
      >
        <motion.div variants={item} className="mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[10px] md:text-xs font-light tracking-[0.22em] uppercase text-pink-200/90 border border-pink-500/30 bg-pink-500/10 backdrop-blur-xl shadow-[0_0_24px_-8px_rgba(236,72,153,0.4)]">
            <span className="relative flex h-2 w-2">
              <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-pink-400" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
            </span>
            {t("heroUrgent")}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-[3rem] sm:text-7xl md:text-8xl lg:text-[6.75rem] font-semibold tracking-[-0.04em] leading-[0.98] mb-6 md:mb-8 text-balance px-1"
        >
          <span className="block text-foreground/92 mb-1 md:mb-2">{t("heroTitle")}</span>
          <span className="relative inline-block">
            <span
              className="absolute -inset-x-8 -inset-y-4 rounded-full opacity-60 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(236,72,153,0.35) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)",
              }}
              aria-hidden
            />
            <span className="relative block bg-gradient-to-r from-pink-200 via-rose-400 to-purple-400 bg-clip-text text-transparent hero-text-glow cinematic-headline-glow">
              {t("heroHighlight")}
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground/85 font-extralight max-w-2xl mx-auto mb-4 leading-relaxed tracking-wide px-2"
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.p
          variants={item}
          className="text-xs md:text-sm text-pink-400/75 font-light mb-12 md:mb-16 tracking-[0.15em] uppercase"
        >
          {t("heroTimeRunning")}
        </motion.p>

        <motion.div variants={item} className="mb-5">
          <motion.div
            animate={pulse && !reduceMotion ? { scale: [1, 1.015, 1] } : {}}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center justify-center gap-3 sm:gap-5 md:gap-7"
          >
            {[
              { value: timeLeft.hours, label: t("hours") },
              { value: timeLeft.minutes, label: t("minutes") },
              { value: timeLeft.seconds, label: t("seconds") },
            ].map((unit, index) => (
              <motion.div
                key={unit.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className={cn(
                    "premium-timer-cell rounded-2xl md:rounded-3xl px-4 py-3.5 md:px-8 md:py-6 min-w-[76px] sm:min-w-[92px] md:min-w-[116px]",
                    index === 2 && pulse && "ring-1 ring-pink-500/40"
                  )}
                >
                  <span className="text-3xl sm:text-5xl md:text-6xl font-extralight tabular-nums text-foreground tracking-tight">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </motion.div>
                <span className="text-[10px] md:text-xs text-muted-foreground/80 mt-2.5 md:mt-4 block font-light uppercase tracking-[0.2em]">
                  {unit.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p variants={item} className="text-sm text-muted-foreground/75 font-light mb-12 md:mb-16 tracking-wide">
          {t("untilDisappear")}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2 max-w-md sm:max-w-none mx-auto"
        >
          <PremiumButton href="/register" className="w-full sm:w-auto min-h-[54px] text-base">
            {t("startSearch")}
          </PremiumButton>
          <PremiumButton href="/#how" variant="ghost" className="w-full sm:w-auto min-h-[54px]">
            {t("learnMore")}
          </PremiumButton>
        </motion.div>
      </motion.div>
    </section>
  )
}
