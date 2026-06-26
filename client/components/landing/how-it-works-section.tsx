"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

const STEP_KEYS = [
  {
    num: "01",
    icon: "👆",
    titleKey: "ttmLandingHowStep1Title" as const,
    descKey: "ttmLandingHowStep1Desc" as const,
    glow: "pink" as const,
  },
  {
    num: "02",
    icon: "💜",
    titleKey: "ttmLandingHowStep2Title" as const,
    descKey: "ttmLandingHowStep2Desc" as const,
    glow: "purple" as const,
  },
  {
    num: "03",
    icon: "⏰",
    titleKey: "ttmLandingHowStep3Title" as const,
    descKey: "ttmLandingHowStep3Desc" as const,
    glow: "green" as const,
  },
]

export function HowItWorksSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="how-it-works" className="ttm-section" aria-labelledby="how-title">
      <div className="ttm-container">
        <motion.div
          className="ttm-section__header"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ttm-eyebrow">{t("ttmLandingHowEyebrow")}</span>
          <h2 id="how-title" className="ttm-title ttm-title--section">
            {t("ttmLandingHowTitle")}
          </h2>
        </motion.div>

        <div className="ttm-steps">
          {STEP_KEYS.map((step, i) => (
            <motion.article
              key={step.num}
              className={`ttm-step ttm-step--${step.glow}`}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25 } }}
            >
              <motion.div
                className="ttm-step__icon-wrapper"
                animate={reduce ? undefined : { boxShadow: ["0 0 20px rgba(255,46,99,0.2)", "0 0 32px rgba(255,46,99,0.45)", "0 0 20px rgba(255,46,99,0.2)"] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              >
                <span className="ttm-step__icon">{step.icon}</span>
              </motion.div>
              <div className="ttm-step__num">{step.num}</div>
              <h3 className="ttm-step__title">{t(step.titleKey)}</h3>
              <p className="ttm-step__desc">{t(step.descKey)}</p>
              {i < STEP_KEYS.length - 1 && (
                <div className="ttm-step__arrow" aria-hidden>
                  →
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
