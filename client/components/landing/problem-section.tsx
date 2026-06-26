"use client"

import { motion, useReducedMotion } from "motion/react"

const PAINS = [
  {
    icon: "👻",
    text: "You match, send a message, and hear nothing back — for days, weeks, or ever.",
  },
  {
    icon: "💬",
    text: "Conversations die after \"hey\" because there's zero urgency to actually connect.",
  },
  {
    icon: "📥",
    text: "Your inbox fills with ignored matches while real connections get buried.",
  },
] as const

export function ProblemSection() {
  const reduce = useReducedMotion()

  return (
    <section
      id="problem"
      className="ttm-landing-section"
      aria-labelledby="problem-title"
      style={{ background: "linear-gradient(180deg, transparent, rgba(255,46,99,0.04), transparent)" }}
    >
      <div className="ttm-landing-container ttm-landing-split">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-landing-eyebrow">The problem</p>
          <h2 id="problem-title" className="ttm-landing-title ttm-landing-title--section">
            Tired of being ghosted?
          </h2>
          <p className="ttm-landing-sub" style={{ marginTop: "1rem" }}>
            Traditional dating apps let matches sit forever. No pressure, no momentum — just endless
            unread messages and fading hope.
          </p>
        </motion.div>

        <motion.ul
          className="ttm-landing-pain-list"
          initial={reduce ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {PAINS.map((pain) => (
            <li key={pain.icon} className="ttm-landing-pain-item">
              <span className="ttm-landing-pain-item__icon" aria-hidden>
                {pain.icon}
              </span>
              <p className="ttm-landing-pain-item__text">{pain.text}</p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
