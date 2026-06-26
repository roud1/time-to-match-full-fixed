"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { isLoggedIn } from "@/client/lib/user-profile"

export function FinalCtaSection() {
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-landing-final" aria-labelledby="final-cta-title">
      <div className="ttm-landing-container">
        <motion.div
          className="ttm-landing-glass ttm-landing-glass--glow ttm-landing-final__card"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            id="final-cta-title"
            className="ttm-landing-title ttm-landing-title--section ttm-landing-final__title"
          >
            Don&apos;t miss your match
          </h2>
          <p className="ttm-landing-sub ttm-landing-final__sub">
            Join thousands who are done waiting for replies. Your next real conversation starts with
            one swipe — and 24 hours on the clock.
          </p>
          <Link href={ctaHref} className="ttm-landing-btn ttm-landing-btn--primary ttm-landing-btn--lg">
            Start Matching
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
