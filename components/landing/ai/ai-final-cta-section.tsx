"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { isLoggedIn } from "@/lib/user-profile"

export function AiFinalCtaSection() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-ai-section ttm-ai-final" aria-labelledby="ai-final-title">
      <div className="ttm-ai-final__bg" aria-hidden>
        <div className="ttm-ai-final__mesh" />
        <div className="ttm-ai-final__glow ttm-ai-final__glow--blue" />
        <div className="ttm-ai-final__glow ttm-ai-final__glow--pink" />
      </div>

      <div className="ttm-ai-container ttm-ai-final__inner">
        <motion.h2
          id="ai-final-title"
          className="ttm-ai-final__title"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Start with real connection
        </motion.h2>

        <motion.p
          className="ttm-ai-final__sub"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
        >
          No endless swiping. No guessing. Just signal.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
        >
          <Link href={ctaHref} className="ttm-ai-cta ttm-ai-cta--xl">
            <span className="ttm-ai-cta__glow" aria-hidden />
            Start with real connection
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
