"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

export function FinalCtaSection() {
  const { t } = useI18n()
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
            {t("ttmLandingFinalTitle")}
          </h2>
          <p className="ttm-landing-sub ttm-landing-final__sub">{t("ttmLandingFinalSub")}</p>
          <Link href={ctaHref} className="ttm-landing-btn ttm-landing-btn--primary ttm-landing-btn--lg">
            {t("datingHeroCta")}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
