"use client"

import { motion, useReducedMotion } from "motion/react"
import { Check } from "lucide-react"

const TRUST_ITEMS = [
  "Communication patterns",
  "Response timing",
  "Behavioral similarity",
  "Emotional indicators",
] as const

export function AiTrustSection() {
  const reduce = useReducedMotion()

  return (
    <section className="ttm-ai-section ttm-ai-trust" aria-labelledby="ai-trust-title">
      <div className="ttm-ai-container">
        <motion.p
          className="ttm-ai-section__eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trust layer
        </motion.p>
        <motion.h2
          id="ai-trust-title"
          className="ttm-ai-section__title"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          What the AI actually reads
        </motion.h2>

        <ul className="ttm-ai-trust__list">
          {TRUST_ITEMS.map((item, i) => (
            <motion.li
              key={item}
              className="ttm-ai-trust__item"
              initial={reduce ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-ai-trust__check" aria-hidden>
                <Check size={16} strokeWidth={2.5} />
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
