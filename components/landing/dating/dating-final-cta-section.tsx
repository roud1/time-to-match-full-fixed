"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { DatingPulseLine } from "@/components/landing/dating/dating-pulse-line"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"

export function DatingFinalCtaSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [ctaHref, setCtaHref] = useState("/register")

  useEffect(() => {
    setCtaHref(isLoggedIn() ? "/app" : "/register")
  }, [])

  return (
    <section className="ttm-dating-section ttm-dating-final-cta" aria-labelledby="dating-final-cta-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <motion.div
            className="ttm-dating-glass-card ttm-dating-final-cta__card"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-final-cta__glow" aria-hidden />
            <h2 id="dating-final-cta-title" className="ttm-dating-final-cta__title">
              {t("datingFinalCtaTitle")}
            </h2>
            <p className="ttm-dating-final-cta__sub">{t("datingFinalCtaSub")}</p>
            <DatingPulseLine className="ttm-dating-final-cta__pulse" />
            <Link href={ctaHref} className="ttm-dating-cta ttm-dating-cta--hero">
              <span className="ttm-dating-cta__shine" aria-hidden />
              {t("datingFinalCtaButton")}
            </Link>
          </motion.div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
