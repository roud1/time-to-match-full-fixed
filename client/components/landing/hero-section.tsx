"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { AnimatedSwipeCards } from "@/client/components/landing/animated-swipe-cards"
import { isLoggedIn } from "@/client/lib/user-profile"

export function HeroSection() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <section className="ttm-landing-hero" aria-labelledby="landing-hero-title">
      <div className="ttm-landing-container ttm-landing-hero__grid">
        <div>
          <motion.p className="ttm-landing-eyebrow" {...fade(0)}>
            Time to Match
          </motion.p>

          <motion.h1 id="landing-hero-title" className="ttm-landing-title" {...fade(0.08)}>
            Match.
            <span className="ttm-landing-title__accent">24 Hours. Or Gone.</span>
          </motion.h1>

          <motion.p className="ttm-landing-sub" style={{ marginTop: "1.25rem" }} {...fade(0.18)}>
            No ghosting. Only real conversations. Every mutual match gets a 24-hour window — use it
            or lose it forever.
          </motion.p>

          <motion.div className="ttm-landing-hero__actions" {...fade(0.28)}>
            <Link href={ctaHref} className="ttm-landing-btn ttm-landing-btn--primary ttm-landing-btn--lg">
              Start Matching
            </Link>
            <Link href="/login" className="ttm-landing-btn ttm-landing-btn--ghost">
              Log in
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="ttm-landing-hero__visual"
          initial={reduce ? false : { opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatedSwipeCards />
        </motion.div>
      </div>
    </section>
  )
}
