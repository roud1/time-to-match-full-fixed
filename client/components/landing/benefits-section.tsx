"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"

const BENEFITS = [
  {
    icon: "🚫",
    titleKey: "ttmLandingBenefit1Title",
    descKey: "ttmLandingBenefit1Desc",
  },
  {
    icon: "💬",
    titleKey: "ttmLandingBenefit2Title",
    descKey: "ttmLandingBenefit2Desc",
  },
  {
    icon: "🛡",
    titleKey: "ttmLandingBenefit3Title",
    descKey: "ttmLandingBenefit3Desc",
  },
] as const satisfies ReadonlyArray<{
  icon: string
  titleKey: TranslationKey
  descKey: TranslationKey
}>

export function BenefitsSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="benefits" className="ttm-landing-section" aria-labelledby="benefits-title">
      <div className="ttm-landing-container">
        <div className="ttm-landing-section__header" style={{ textAlign: "center", marginInline: "auto" }}>
          <p className="ttm-landing-eyebrow">{t("ttmLandingBenefitsEyebrow")}</p>
          <h2
            id="benefits-title"
            className="ttm-landing-title ttm-landing-title--section"
            style={{ maxWidth: "none", marginInline: "auto" }}
          >
            {t("ttmLandingBenefitsTitle")}
          </h2>
        </div>

        <div className="ttm-landing-benefits">
          {BENEFITS.map((benefit, i) => (
            <motion.article
              key={benefit.titleKey}
              className="ttm-landing-glass ttm-landing-benefit"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-landing-benefit__icon" aria-hidden>
                {benefit.icon}
              </span>
              <h3 className="ttm-landing-benefit__title">{t(benefit.titleKey)}</h3>
              <p className="ttm-landing-benefit__desc">{t(benefit.descKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
