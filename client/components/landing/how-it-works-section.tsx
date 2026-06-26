"use client"

import { motion, useReducedMotion } from "motion/react"
import { useRef } from "react"

const STEPS = [
  {
    num: "01",
    title: "Swipe",
    desc: "Browse profiles that match your vibe. Like what you see? Swipe right. Not feeling it? Keep moving.",
  },
  {
    num: "02",
    title: "Match",
    desc: "When you both swipe right, it's a match. The clock starts immediately — no waiting, no games.",
  },
  {
    num: "03",
    title: "24h countdown",
    desc: "You have exactly 24 hours to start a real conversation. After that, the match disappears forever.",
  },
] as const

export function HowItWorksSection() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="ttm-landing-section"
      aria-labelledby="how-it-works-title"
    >
      <div className="ttm-landing-container">
        <div className="ttm-landing-section__header">
          <p className="ttm-landing-eyebrow">How it works</p>
          <h2 id="how-it-works-title" className="ttm-landing-title ttm-landing-title--section">
            Three steps to a real connection
          </h2>
        </div>

        <div className="ttm-landing-steps">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              className="ttm-landing-glass ttm-landing-step"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ttm-landing-step__num">{step.num}</div>
              <h3 className="ttm-landing-step__title">{step.title}</h3>
              <p className="ttm-landing-step__desc">{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
