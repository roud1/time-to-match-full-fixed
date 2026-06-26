"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

const PAIN_KEYS = [
  { icon: "👻", key: "ttmLandingProblemPain1" as const },
  { icon: "💬", key: "ttmLandingProblemPain2" as const },
  { icon: "📥", key: "ttmLandingProblemPain3" as const },
  { icon: "🔄", key: "ttmLandingProblemPain4" as const },
]

export function ProblemSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <section id="problem" className="ttm-section ttm-section--problem" aria-labelledby="problem-title">
      <div className="ttm-problem__fog" aria-hidden />
      <div className="ttm-container ttm-split">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ttm-eyebrow">{t("ttmLandingProblemEyebrow")}</span>
          <h2 id="problem-title" className="ttm-title ttm-title--section">
            {t("ttmLandingProblemTitle")}
          </h2>
          <p className="ttm-sub" style={{ marginTop: "1rem" }}>
            {t("ttmLandingProblemSub")}
          </p>
        </motion.div>

        <motion.ul
          className="ttm-pain-list"
          initial={reduce ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {PAIN_KEYS.map((pain, i) => (
            <motion.li
              key={pain.key}
              className="ttm-pain-item"
              initial={reduce ? false : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={reduce ? undefined : { x: 4, borderColor: "rgba(255, 46, 99, 0.35)" }}
            >
              <span className="ttm-pain-item__icon" aria-hidden>
                {pain.icon}
              </span>
              <p className="ttm-pain-item__text">{t(pain.key)}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
