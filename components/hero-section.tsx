"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { CinematicParticles } from "@/components/ui/cinematic-particles"
import { PremiumButton } from "@/components/ui/premium-button"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export function HeroSection() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
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
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">
      <CinematicParticles count={28} />

      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,720px)] h-[400px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(ellipse, rgba(236,72,153,0.35) 0%, rgba(168,85,247,0.15) 45%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        <motion.div variants={item} className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] md:text-xs font-light tracking-[0.2em] uppercase text-pink-300/90 border border-pink-500/25 bg-pink-500/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
            </span>
            {t("heroUrgent")}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold md:font-bold tracking-[-0.03em] leading-[1.05] mb-5 md:mb-6 text-balance"
        >
          <span className="block text-foreground/95">{t("heroTitle")}</span>
          <span className="block mt-1 md:mt-2 bg-gradient-to-r from-pink-300 via-rose-400 to-purple-400 bg-clip-text text-transparent cinematic-headline-glow">
            {t("heroHighlight")}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="text-base sm:text-lg md:text-xl text-muted-foreground/90 font-extralight max-w-2xl mx-auto mb-3 leading-relaxed tracking-wide"
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.p variants={item} className="text-xs md:text-sm text-pink-400/80 font-light mb-10 md:mb-14 tracking-wide">
          {t("heroTimeRunning")}
        </motion.p>

        <motion.div variants={item} className="mb-4">
          <motion.div
            animate={pulse && !reduceMotion ? { scale: [1, 1.02, 1] } : {}}
            className="inline-flex items-center justify-center gap-3 sm:gap-5 md:gap-6"
          >
            {[
              { value: timeLeft.hours, label: t("hours") },
              { value: timeLeft.minutes, label: t("minutes") },
              { value: timeLeft.seconds, label: t("seconds") },
            ].map((unit, index) => (
              <motion.div
                key={unit.label}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.08 }}
              >
                <div className="premium-timer-cell rounded-2xl md:rounded-3xl px-4 py-3 md:px-7 md:py-5 min-w-[72px] sm:min-w-[88px] md:min-w-[108px]">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-extralight tabular-nums text-foreground tracking-tight">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground mt-2 md:mt-3 block font-light uppercase tracking-widest">
                  {unit.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.p variants={item} className="text-sm text-muted-foreground/80 font-light mb-10 md:mb-14">
          {t("untilDisappear")}
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2"
        >
          <PremiumButton href="/register" className="w-full sm:w-auto min-h-[52px]">
            {t("startSearch")}
          </PremiumButton>
          <PremiumButton href="/#how" variant="ghost" className="w-full sm:w-auto min-h-[52px]">
            {t("learnMore")}
          </PremiumButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-foreground/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-foreground/40" />
        </div>
      </motion.div>
    </section>
  )
}
