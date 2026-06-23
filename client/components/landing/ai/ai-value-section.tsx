"use client"

import { motion, useReducedMotion } from "motion/react"

export function AiValueSection() {
  const reduce = useReducedMotion()

  return (
    <section className="ttm-ai-section ttm-ai-value" aria-labelledby="ai-value-title">
      <div className="ttm-ai-value__beam" aria-hidden />
      <div className="ttm-ai-container ttm-ai-value__inner">
        <motion.blockquote
          id="ai-value-title"
          className="ttm-ai-value__quote"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-ai-value__line">Not all matches are equal.</p>
          <p className="ttm-ai-value__line ttm-ai-value__line--dim">Some are just noise.</p>
          <p className="ttm-ai-value__line ttm-ai-value__line--accent">
            We show you what matters.
          </p>
        </motion.blockquote>
      </div>
    </section>
  )
}
