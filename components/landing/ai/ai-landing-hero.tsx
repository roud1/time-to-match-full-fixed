"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { AiNeuralBackground } from "@/components/landing/ai/ai-neural-background"
import { isLoggedIn } from "@/lib/user-profile"

export function AiLandingHero() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-ai-hero" aria-labelledby="ai-hero-title">
      <div className="ttm-ai-hero__bg" aria-hidden>
        <AiNeuralBackground />
        <div className="ttm-ai-hero__mesh" />
        <div className="ttm-ai-hero__glow ttm-ai-hero__glow--blue" />
        <div className="ttm-ai-hero__glow ttm-ai-hero__glow--pink" />
        <div className="ttm-ai-hero__vignette" />
        <div className="ttm-ai-hero__scanline" />
      </div>

      <div className="ttm-ai-hero__content">
        <motion.div
          className="ttm-ai-hero__badge"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="ttm-ai-hero__badge-dot" aria-hidden />
          AI Connection Engine
        </motion.div>

        <motion.h1
          id="ai-hero-title"
          className="ttm-ai-hero__title"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          We don&apos;t match people.
          <br />
          <span className="ttm-ai-hero__title-accent">We detect connection.</span>
        </motion.h1>

        <motion.p
          className="ttm-ai-hero__urgency-line"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.14 }}
        >
          You have <strong>24 hours</strong> to find out if it&apos;s real.
        </motion.p>

        <motion.div
          className="ttm-ai-hero__actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
        >
          <Link href={ctaHref} className="ttm-ai-cta">
            <span className="ttm-ai-cta__glow" aria-hidden />
            See your connection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
