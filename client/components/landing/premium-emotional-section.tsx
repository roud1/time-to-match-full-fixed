"use client"

import { motion, useReducedMotion } from "motion/react"

export function PremiumEmotionalSection() {
  const reduce = useReducedMotion()

  return (
    <section className="ttm-premium-section ttm-premium-emotional" aria-labelledby="emotional-title">
      <div className="ttm-premium-emotional__gradient" aria-hidden />
      <div className="ttm-premium-container ttm-premium-emotional__inner">
        <motion.blockquote
          id="emotional-title"
          className="ttm-premium-emotional__quote"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-premium-emotional__line">Most matches never become anything.</p>
          <p className="ttm-premium-emotional__line ttm-premium-emotional__line--muted">
            Because people wait.
          </p>
          <p className="ttm-premium-emotional__line ttm-premium-emotional__line--accent">
            We fixed that.
          </p>
        </motion.blockquote>
      </div>
    </section>
  )
}
