"use client"

import { motion, useReducedMotion } from "motion/react"

export function AiUrgencySection() {
  const reduce = useReducedMotion()

  return (
    <section className="ttm-ai-section ttm-ai-urgency" aria-labelledby="ai-urgency-title">
      <div className="ttm-ai-urgency__pulse-ring" aria-hidden />
      <div className="ttm-ai-container ttm-ai-urgency__inner">
        <motion.h2
          id="ai-urgency-title"
          className="ttm-ai-urgency__title"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          Connections expire every day.
        </motion.h2>
        <motion.p
          className="ttm-ai-urgency__sub"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Real signal doesn&apos;t sit in your inbox. You have{" "}
          <span className="ttm-ai-urgency__24">24 hours</span> to act.
        </motion.p>
      </div>
    </section>
  )
}
