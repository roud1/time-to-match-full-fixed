"use client"

import { Clock, Heart, MessageCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const STEPS: {
  icon: LucideIcon
  titleKey: TranslationKey
  textKey: TranslationKey
}[] = [
  { icon: Heart, titleKey: "datingHow1Title", textKey: "datingHow1Text" },
  { icon: MessageCircle, titleKey: "datingHow2Title", textKey: "datingHow2Text" },
  { icon: Clock, titleKey: "datingHow3Title", textKey: "datingHow3Text" },
]

export function DatingHowSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="how" className="ttm-dating-section ttm-dating-how" aria-labelledby="dating-how-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingHowTitle")}</p>
          <h2 id="dating-how-title" className="ttm-dating-section__title">
            {t("datingFlowTitle")}
          </h2>
        </DatingScrollReveal>

        <ol className="ttm-dating-how__grid">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.li
                key={step.titleKey}
                className="ttm-dating-glass-card ttm-dating-how__card"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="ttm-dating-how__icon-wrap">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="ttm-dating-how__step-title">{t(step.titleKey)}</h3>
                <p className="ttm-dating-how__step-text">{t(step.textKey)}</p>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
