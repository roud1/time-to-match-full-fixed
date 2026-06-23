"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { PulseCharacter } from "@/client/components/landing/pulse-character"
import { isLoggedIn } from "@/client/lib/user-profile"

export function PremiumLandingHero() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-premium-hero" aria-labelledby="premium-hero-title">
      <div className="ttm-premium-hero__bg" aria-hidden>
        <div className="ttm-premium-hero__mesh" />
        <div className="ttm-premium-hero__glow ttm-premium-hero__glow--violet" />
        <div className="ttm-premium-hero__glow ttm-premium-hero__glow--rose" />
        <div className="ttm-premium-hero__glow ttm-premium-hero__glow--pink" />
        <div className="ttm-premium-hero__vignette" />
      </div>

      <div className="ttm-premium-hero__grid">
        <div className="ttm-premium-hero__copy">
          <motion.p
            className="ttm-premium-hero__eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Time to Match
          </motion.p>
          <motion.h1
            id="premium-hero-title"
            className="ttm-premium-hero__title"
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Find your match in{" "}
            <span className="ttm-premium-hero__title-accent">24 hours.</span>
            <br />
            Or lose them forever.
          </motion.h1>
          <motion.p
            className="ttm-premium-hero__sub"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            A new way to meet people. Fast. Emotional. Real.
          </motion.p>
          <motion.div
            className="ttm-premium-hero__actions"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={ctaHref} className="ttm-premium-cta">
              <span className="ttm-premium-cta__shine" aria-hidden />
              Start your 24h match
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="ttm-premium-hero__pulse-wrap"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <PulseCharacter size="hero" />
        </motion.div>
      </div>
    </section>
  )
}
