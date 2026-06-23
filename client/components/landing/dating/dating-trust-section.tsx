"use client"

import { Check } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { DatingScrollReveal } from "@/client/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"

const TRUST_KEYS: TranslationKey[] = [
  "datingTrust1",
  "datingTrust2",
  "datingTrust3",
  "datingTrust4",
]

export function DatingTrustSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section className="ttm-dating-section ttm-dating-section--compact ttm-dating-trust" aria-labelledby="dating-trust-title">
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <h2 id="dating-trust-title" className="ttm-dating-section__title">
            {t("datingTrustTitle")}
          </h2>
        </DatingScrollReveal>

        <ul className="ttm-dating-trust__list">
          {TRUST_KEYS.map((key, i) => (
            <motion.li
              key={key}
              className="ttm-dating-trust__item"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-dating-trust__check" aria-hidden>
                <Check size={18} strokeWidth={2.5} />
              </span>
              {t(key)}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
