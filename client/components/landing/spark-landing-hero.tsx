"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useState } from "react"
import { SparkLandingHeroFloats } from "@/client/components/landing/spark-landing-hero-floats"
import { isLoggedIn } from "@/client/lib/user-profile"

export function SparkLandingHero() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")
  const { scrollY } = useScroll()

  const titleY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -140])
  const contentOpacity = useTransform(scrollY, [0, 400], [1, reduce ? 1 : 0.35])

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="spark-landing__hero spark-landing__hero--cinematic" aria-labelledby="spark-hero-title">
      <div className="spark-landing__hero-accents" aria-hidden>
        <div className="spark-landing__hero-accent spark-landing__hero-accent--1" />
        <div className="spark-landing__hero-accent spark-landing__hero-accent--2" />
        <div className="spark-landing__hero-accent spark-landing__hero-accent--3" />
      </div>
      <SparkLandingHeroFloats />
      <motion.div className="spark-landing__hero-inner" style={{ y: titleY, opacity: contentOpacity }}>
        <motion.h1
          id="spark-hero-title"
          className="spark-landing__hero-title"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="spark-landing__hero-title-line">24 часа, чтобы зажечь искру.</span>
          <span className="spark-landing__hero-title-line spark-landing__hero-title-line--accent">
            24 часа, чтобы не потерять.
          </span>
        </motion.h1>
        <motion.p
          className="spark-landing__hero-sub"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          Дейтинг, где время решает всё. Анкеты и мэтчи живут по своим правилам — не упусти момент.
        </motion.p>
        <motion.div
          className="spark-landing__hero-actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={ctaHref} className="spark-landing__cta spark-landing__cta--glow">
            <span className="spark-landing__cta-ring" aria-hidden />
            <Sparkles className="spark-landing__cta-icon" aria-hidden strokeWidth={1.75} />
            Создать анкету
          </Link>
        </motion.div>
      </motion.div>
      <div className="spark-landing__hero-scroll-hint" aria-hidden>
        <span className="spark-landing__hero-scroll-dot" />
      </div>
    </section>
  )
}
