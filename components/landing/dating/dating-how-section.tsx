"use client"

import { motion, useReducedMotion } from "motion/react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const STEPS: { num: string; titleKey: TranslationKey }[] = [
  { num: "01", titleKey: "datingHow1Title" },
  { num: "02", titleKey: "datingHow2Title" },
  { num: "03", titleKey: "datingHow3Title" },
]

export function DatingHowSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="how" className="ttm-dating-section ttm-dating-how" aria-labelledby="dating-how-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <h2 id="dating-how-title" className="ttm-dating-how__label">
            {t("datingHowTitle")}
          </h2>
        </DatingScrollReveal>

        <ol className="ttm-dating-how__steps">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.num}
              className="ttm-dating-how__step"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-dating-how__num">{step.num}</span>
              <h3 className="ttm-dating-how__step-title">{t(step.titleKey)}</h3>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
