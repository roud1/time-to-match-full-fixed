"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { SparkLandingHeroFloats } from "@/components/landing/spark-landing-hero-floats"
import { isLoggedIn } from "@/lib/user-profile"

export function SparkLandingHero() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="spark-landing__hero" aria-labelledby="spark-hero-title">
      <div className="spark-landing__hero-bg" aria-hidden />
      <SparkLandingHeroFloats />
      <div className="spark-landing__hero-inner">
        <motion.h1
          id="spark-hero-title"
          className="spark-landing__hero-title"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="spark-landing__hero-title-line">72 часа, чтобы засиять.</span>
          <span className="spark-landing__hero-title-line spark-landing__hero-title-line--accent">
            24 часа, чтобы не потерять.
          </span>
        </motion.h1>
        <motion.p
          className="spark-landing__hero-sub"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Дейтинг, где время решает всё. Анкеты и мэтчи живут по своим правилам — не упусти момент.
        </motion.p>
        <motion.div
          className="spark-landing__hero-actions"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={ctaHref} className="spark-landing__cta">
            <Sparkles className="spark-landing__cta-icon" aria-hidden strokeWidth={1.75} />
            Создать анкету
          </Link>
        </motion.div>
      </div>
      <div className="spark-landing__hero-scroll-hint" aria-hidden>
        <span className="spark-landing__hero-scroll-dot" />
      </div>
    </section>
  )
}
