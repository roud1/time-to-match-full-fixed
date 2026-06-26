"use client"

import { motion, useReducedMotion } from "motion/react"
import { useRef } from "react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"

const STEPS = [
  { num: "01", titleKey: "ttmLandingHowStep1Title", descKey: "ttmLandingHowStep1Desc" },
  { num: "02", titleKey: "ttmLandingHowStep2Title", descKey: "ttmLandingHowStep2Desc" },
  { num: "03", titleKey: "ttmLandingHowStep3Title", descKey: "ttmLandingHowStep3Desc" },
] as const satisfies ReadonlyArray<{
  num: string
  titleKey: TranslationKey
  descKey: TranslationKey
}>

export function HowItWorksSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="ttm-landing-section"
      aria-labelledby="how-it-works-title"
    >
      <div className="ttm-landing-container">
        <div className="ttm-landing-section__header">
          <p className="ttm-landing-eyebrow">{t("ttmLandingHowEyebrow")}</p>
          <h2 id="how-it-works-title" className="ttm-landing-title ttm-landing-title--section">
            {t("ttmLandingHowTitle")}
          </h2>
        </div>

        <div className="ttm-landing-steps">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              className="ttm-landing-glass ttm-landing-step"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ttm-landing-step__num">{step.num}</div>
              <h3 className="ttm-landing-step__title">{t(step.titleKey)}</h3>
              <p className="ttm-landing-step__desc">{t(step.descKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
