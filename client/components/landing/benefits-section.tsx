"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

const BENEFIT_KEYS = [
  { icon: "🚫", titleKey: "ttmLandingBenefit1Title" as const, descKey: "ttmLandingBenefit1Desc" as const },
  { icon: "💬", titleKey: "ttmLandingBenefit2Title" as const, descKey: "ttmLandingBenefit2Desc" as const },
  { icon: "🛡", titleKey: "ttmLandingBenefit3Title" as const, descKey: "ttmLandingBenefit3Desc" as const },
  { icon: "⚡", titleKey: "ttmLandingBenefit4Title" as const, descKey: "ttmLandingBenefit4Desc" as const },
  { icon: "✨", titleKey: "ttmLandingBenefit5Title" as const, descKey: "ttmLandingBenefit5Desc" as const },
]

export function BenefitsSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="benefits" className="ttm-section" aria-labelledby="benefits-title">
      <div className="ttm-container">
        <motion.div
          className="ttm-section__header ttm-section__header--center"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="ttm-eyebrow">{t("ttmLandingBenefitsEyebrow")}</span>
          <h2 id="benefits-title" className="ttm-title ttm-title--section ttm-title--center">
            {t("ttmLandingBenefitsTitle")}
          </h2>
        </motion.div>

        <div className="ttm-benefits">
          {BENEFIT_KEYS.map((benefit, i) => (
            <motion.article
              key={benefit.titleKey}
              className="ttm-glass ttm-benefit"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={
                reduce
                  ? undefined
                  : {
                      y: -6,
                      boxShadow: "0 0 32px rgba(255, 46, 99, 0.25), 0 0 64px rgba(108, 92, 231, 0.12)",
                      borderColor: "rgba(0, 255, 163, 0.35)",
                    }
              }
            >
              <span className="ttm-benefit__icon" aria-hidden>
                {benefit.icon}
              </span>
              <h3 className="ttm-benefit__title">{t(benefit.titleKey)}</h3>
              <p className="ttm-benefit__desc">{t(benefit.descKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
