"use client"

import { motion, useReducedMotion } from "motion/react"

const TESTIMONIALS = [
  {
    quote:
      "I stopped wasting nights on dead chats. The score told me who was actually present — scary accurate.",
    name: "Maya L.",
    role: "Product designer, Berlin",
  },
  {
    quote:
      "It feels less like swiping and more like a signal. The 24h window forces honesty. I met someone real in week one.",
    name: "Chris R.",
    role: "Founder, Austin",
  },
  {
    quote:
      "Finally an app that treats connection like data, not luck. The AI nudged me when timing mattered.",
    name: "Sofia K.",
    role: "Therapist, London",
  },
] as const

export function AiSocialProofSection() {
  const reduce = useReducedMotion()

  return (
    <section className="ttm-ai-section ttm-ai-proof" aria-labelledby="ai-proof-title">
      <div className="ttm-ai-container">
        <motion.p
          className="ttm-ai-section__eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Early voices
        </motion.p>
        <motion.h2
          id="ai-proof-title"
          className="ttm-ai-section__title"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Built for people who are done guessing
        </motion.h2>

        <div className="ttm-ai-proof__grid">
          {TESTIMONIALS.map((item, i) => (
            <motion.blockquote
              key={item.name}
              className="ttm-ai-proof__card"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="ttm-ai-proof__quote">&ldquo;{item.quote}&rdquo;</p>
              <footer className="ttm-ai-proof__meta">
                <cite className="ttm-ai-proof__name">{item.name}</cite>
                <span className="ttm-ai-proof__role">{item.role}</span>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
