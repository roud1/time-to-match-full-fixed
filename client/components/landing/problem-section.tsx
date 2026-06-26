"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n, type TranslationKey } from "@/client/lib/i18n"

const PAINS = [
  { icon: "👻", key: "ttmLandingProblemPain1" as const },
  { icon: "💬", key: "ttmLandingProblemPain2" as const },
  { icon: "📥", key: "ttmLandingProblemPain3" as const },
] satisfies ReadonlyArray<{ icon: string; key: TranslationKey }>

export function ProblemSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section
      id="problem"
      className="ttm-landing-section"
      aria-labelledby="problem-title"
      style={{ background: "linear-gradient(180deg, transparent, rgba(255,46,99,0.04), transparent)" }}
    >
      <div className="ttm-landing-container ttm-landing-split">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-landing-eyebrow">{t("ttmLandingProblemEyebrow")}</p>
          <h2 id="problem-title" className="ttm-landing-title ttm-landing-title--section">
            {t("ttmLandingProblemTitle")}
          </h2>
          <p className="ttm-landing-sub" style={{ marginTop: "1rem" }}>
            {t("ttmLandingProblemSub")}
          </p>
        </motion.div>

        <motion.ul
          className="ttm-landing-pain-list"
          initial={reduce ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {PAINS.map((pain) => (
            <li key={pain.key} className="ttm-landing-pain-item">
              <span className="ttm-landing-pain-item__icon" aria-hidden>
                {pain.icon}
              </span>
              <p className="ttm-landing-pain-item__text">{t(pain.key)}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
