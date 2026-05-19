"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"

export function HeroSection() {
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState({ hours: 71, minutes: 59, seconds: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 overflow-hidden">

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Small label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-light tracking-widest uppercase text-muted-foreground border border-foreground/10 bg-foreground/5">
            {t("badge")}
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight leading-[1.1] mb-6 text-balance"
        >
          {t("heroTitle")}{" "}
          <span className="text-glow bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            {t("heroHighlight")}
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* Countdown timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-4 md:gap-6 mb-12"
        >
          {[
            { value: timeLeft.hours, label: t("hours") },
            { value: timeLeft.minutes, label: t("minutes") },
            { value: timeLeft.seconds, label: t("seconds") },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="glass-card rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
                <span className="text-2xl md:text-4xl font-light tabular-nums text-foreground">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-2 block font-light">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="text-sm text-muted-foreground font-light mb-12"
        >
          {t("untilDisappear") as string}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-light text-base tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-shadow duration-300 hover:opacity-95"
          >
            {t("startSearch")}
          </Link>
          <Link
            href="/#how"
            className="px-8 py-4 rounded-full border border-foreground/10 text-foreground/80 font-light text-base hover:bg-foreground/5 transition-all duration-300"
          >
            {t("learnMore")}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
