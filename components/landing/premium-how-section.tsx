"use client"

import { motion, useReducedMotion } from "motion/react"

const STEPS = [
  {
    num: "01",
    title: "Match",
    text: "Feel the spark. Match instantly.",
  },
  {
    num: "02",
    title: "24 hours",
    text: "Talk now. Every second counts.",
  },
  {
    num: "03",
    title: "Gone forever",
    text: "Miss the window — they're gone. No replays.",
  },
] as const

export function PremiumHowSection() {
  const reduce = useReducedMotion()

  return (
    <section id="how" className="ttm-premium-section ttm-premium-how" aria-labelledby="how-title">
      <div className="ttm-premium-container">
        <p className="ttm-premium-section__eyebrow">The rules</p>
        <h2 id="how-title" className="ttm-premium-section__title">
          How it works
        </h2>
        <ol className="ttm-premium-how__steps">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.num}
              className="ttm-premium-how__step"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-premium-how__num">{step.num}</span>
              <h3 className="ttm-premium-how__step-title">{step.title}</h3>
              <p className="ttm-premium-how__step-text">{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
