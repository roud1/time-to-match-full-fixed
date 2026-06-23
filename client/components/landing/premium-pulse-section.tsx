"use client"

import { motion, useReducedMotion } from "motion/react"
import { PulseCharacter } from "@/client/components/landing/pulse-character"

const RULES = [
  {
    id: "grow",
    line: "It grows when you connect",
    state: "alive" as const,
  },
  {
    id: "fade",
    line: "It fades when you wait",
    state: "fading" as const,
  },
  {
    id: "die",
    line: "It dies in 24 hours",
    state: "dead" as const,
  },
] as const

export function PremiumPulseSection() {
  const reduce = useReducedMotion()

  return (
    <section id="pulse" className="ttm-premium-section ttm-premium-pulse-rules" aria-labelledby="pulse-rules-title">
      <div className="ttm-premium-pulse-rules__bg" aria-hidden />
      <div className="ttm-premium-container ttm-premium-pulse-rules__inner">
        <motion.div
          className="ttm-premium-pulse-rules__visual"
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <PulseCharacter size="compact" />
        </motion.div>

        <div className="ttm-premium-pulse-rules__copy">
          <motion.p
            className="ttm-premium-section__eyebrow"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Pulse
          </motion.p>
          <motion.h2
            id="pulse-rules-title"
            className="ttm-premium-pulse-rules__title"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Your connection has a heartbeat.
          </motion.h2>

          <ul className="ttm-premium-pulse-rules__list">
            {RULES.map((rule, i) => (
              <motion.li
                key={rule.id}
                className={`ttm-premium-pulse-rules__item ttm-premium-pulse-rules__item--${rule.state}`}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="ttm-premium-pulse-rules__dot" aria-hidden />
                <span className="ttm-premium-pulse-rules__line">{rule.line}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
