"use client"

import { motion, useReducedMotion } from "motion/react"
import { AiThinkingVisual } from "@/components/landing/ai/ai-thinking-visual"

export function AiThinkingSection() {
  const reduce = useReducedMotion()

  return (
    <section id="thinking" className="ttm-ai-section ttm-ai-thinking" aria-labelledby="ai-thinking-title">
      <div className="ttm-ai-thinking__glow" aria-hidden />
      <div className="ttm-ai-container ttm-ai-thinking__layout">
        <div className="ttm-ai-thinking__copy">
          <motion.p
            className="ttm-ai-section__eyebrow ttm-ai-section__eyebrow--left"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Under the hood
          </motion.p>
          <motion.h2
            id="ai-thinking-title"
            className="ttm-ai-thinking__title"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            How AI thinks
          </motion.h2>
          <motion.p
            className="ttm-ai-thinking__lead"
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            Thousands of micro-signals collapse into one score — in real time, while you
            actually talk.
          </motion.p>
        </div>

        <motion.div
          className="ttm-ai-thinking__panel"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <AiThinkingVisual />
        </motion.div>
      </div>
    </section>
  )
}
