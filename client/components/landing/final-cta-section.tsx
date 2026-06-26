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
    <section className="ttm-section ttm-final" aria-labelledby="final-cta-title">
      <div className="ttm-container">
        <motion.div
          className="ttm-glass ttm-glass--glow ttm-final__card"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 id="final-cta-title" className="ttm-title ttm-title--section ttm-final__title">
            {t("ttmLandingFinalTitle")}
          </h2>
          <p className="ttm-sub ttm-final__sub">{t("ttmLandingFinalSub")}</p>

          <motion.div
            className="ttm-final__cta-wrap"
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <Link href={ctaHref} className="ttm-btn ttm-btn--primary ttm-btn--lg ttm-final__cta">
              <span className="ttm-final__cta-shimmer" aria-hidden />
              {t("ttmLandingFinalCta")}
            </Link>
          </motion.div>

          <p className="ttm-final__note">{t("ttmLandingFinalNote")}</p>
        </motion.div>
      </div>
    </section>
  )
}
