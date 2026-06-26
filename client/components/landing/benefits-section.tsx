"use client"

import { motion, useReducedMotion } from "motion/react"

const BENEFITS = [
  {
    icon: "🚫",
    title: "No ghosting",
    desc: "Matches expire in 24 hours. Nobody sits in your inbox forever pretending they'll reply.",
  },
  {
    icon: "💬",
    title: "Real conversations",
    desc: "Urgency cuts through small talk. People show up ready to connect, not just collect matches.",
  },
  {
    icon: "🛡",
    title: "Less spam",
    desc: "Dead matches disappear automatically. Your feed stays fresh with people who actually engage.",
  },
] as const

export function BenefitsSection() {
  const reduce = useReducedMotion()

  return (
    <section id="benefits" className="ttm-landing-section" aria-labelledby="benefits-title">
      <div className="ttm-landing-container">
        <div className="ttm-landing-section__header" style={{ textAlign: "center", marginInline: "auto" }}>
          <p className="ttm-landing-eyebrow">Why Time to Match</p>
          <h2
            id="benefits-title"
            className="ttm-landing-title ttm-landing-title--section"
            style={{ maxWidth: "none", marginInline: "auto" }}
          >
            Dating that respects your time
          </h2>
        </div>

        <div className="ttm-landing-benefits">
          {BENEFITS.map((benefit, i) => (
            <motion.article
              key={benefit.title}
              className="ttm-landing-glass ttm-landing-benefit"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ttm-landing-benefit__icon" aria-hidden>
                {benefit.icon}
              </span>
              <h3 className="ttm-landing-benefit__title">{benefit.title}</h3>
              <p className="ttm-landing-benefit__desc">{benefit.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
