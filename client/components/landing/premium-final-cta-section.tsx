"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { PulseCharacter } from "@/client/components/landing/pulse-character"
import { isLoggedIn } from "@/client/lib/user-profile"

export function PremiumFinalCtaSection() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-premium-section ttm-premium-final" aria-labelledby="final-cta-title">
      <div className="ttm-premium-final__bg" aria-hidden>
        <div className="ttm-premium-final__mesh" />
        <div className="ttm-premium-final__glow ttm-premium-final__glow--violet" />
        <div className="ttm-premium-final__glow ttm-premium-final__glow--rose" />
      </div>

      <div className="ttm-premium-container ttm-premium-final__inner">
        <motion.div
          className="ttm-premium-final__pulse"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <PulseCharacter size="mini" />
        </motion.div>

        <motion.h2
          id="final-cta-title"
          className="ttm-premium-final__title"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Don&apos;t miss your moment
        </motion.h2>

        <motion.p
          className="ttm-premium-final__sub"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.14 }}
        >
          One match. One day. One chance to feel something real.
        </motion.p>

        <motion.div
          className="ttm-premium-final__actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href={ctaHref} className="ttm-premium-cta ttm-premium-cta--xl">
            <span className="ttm-premium-cta__shine" aria-hidden />
            Start your 24h match
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
