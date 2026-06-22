"use client"

import { Brain, Clock, Shield, Sparkles } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const FEATURES: { icon: LucideIcon; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { icon: Clock, titleKey: "datingFeature1Title", textKey: "datingFeature1Text" },
  { icon: Sparkles, titleKey: "datingFeature2Title", textKey: "datingFeature2Text" },
  { icon: Brain, titleKey: "datingFeature3Title", textKey: "datingFeature3Text" },
  { icon: Shield, titleKey: "datingFeature4Title", textKey: "datingFeature4Text" },
]

export function DatingFeaturesSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="features" className="ttm-dating-section ttm-dating-features" aria-labelledby="dating-features-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingFeaturesEyebrow")}</p>
          <h2 id="dating-features-title" className="ttm-dating-section__title">
            {t("datingFeaturesTitle")}
          </h2>
        </DatingScrollReveal>

        <div className="ttm-dating-features__grid">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.titleKey}
                className="ttm-dating-glass-card ttm-dating-features__card"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2 } }}
              >
                <span className="ttm-dating-features__icon">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="ttm-dating-features__title">{t(feature.titleKey)}</h3>
                <p className="ttm-dating-features__text">{t(feature.textKey)}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
