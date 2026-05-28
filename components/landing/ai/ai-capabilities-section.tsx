"use client"

import { motion, useReducedMotion } from "motion/react"

const CAPABILITIES = [
  {
    id: "signals",
    title: "Signal Analysis",
    hint: "Micro-reactions. Response rhythm. Intent.",
    visual: "signals" as const,
  },
  {
    id: "behavior",
    title: "Behavior Patterns",
    hint: "How you show up. How they respond.",
    visual: "behavior" as const,
  },
  {
    id: "sync",
    title: "Emotional Sync",
    hint: "Alignment beyond the swipe.",
    visual: "sync" as const,
  },
] as const

/** Precomputed endpoints (r=42) — avoids SSR/client float drift in SVG attrs */
const SIGNAL_SPOKES: ReadonlyArray<{ x2: string; y2: string }> = [
  { x2: "102", y2: "60" },
  { x2: "81", y2: "96.37" },
  { x2: "39", y2: "96.37" },
  { x2: "18", y2: "60" },
  { x2: "39", y2: "23.63" },
  { x2: "81", y2: "23.63" },
]

function CapabilityVisual({ type }: { type: (typeof CAPABILITIES)[number]["visual"] }) {
  if (type === "signals") {
    return (
      <svg viewBox="0 0 120 120" className="ttm-ai-cap__svg" aria-hidden>
        <circle cx="60" cy="60" r="48" className="ttm-ai-cap__ring" />
        {SIGNAL_SPOKES.map((spoke, i) => (
          <line
            key={i}
            x1="60"
            y1="60"
            x2={spoke.x2}
            y2={spoke.y2}
            className="ttm-ai-cap__spoke"
          />
        ))}
        <circle cx="60" cy="60" r="8" className="ttm-ai-cap__core" />
        <circle cx="28" cy="38" r="4" className="ttm-ai-cap__node" />
        <circle cx="92" cy="44" r="4" className="ttm-ai-cap__node" />
        <circle cx="78" cy="88" r="4" className="ttm-ai-cap__node" />
      </svg>
    )
  }

  if (type === "behavior") {
    return (
      <svg viewBox="0 0 120 120" className="ttm-ai-cap__svg" aria-hidden>
        <path
          d="M16 88 L36 72 L52 78 L68 48 L88 56 L104 32"
          className="ttm-ai-cap__wave"
          fill="none"
        />
        <path d="M16 88 L104 88" className="ttm-ai-cap__axis" />
        {[32, 56, 72, 88].map((y) => (
          <line key={y} x1="16" y1={y} x2="104" y2={y} className="ttm-ai-cap__grid" />
        ))}
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 120" className="ttm-ai-cap__svg" aria-hidden>
      <circle cx="42" cy="60" r="28" className="ttm-ai-cap__orb ttm-ai-cap__orb--a" />
      <circle cx="78" cy="60" r="28" className="ttm-ai-cap__orb ttm-ai-cap__orb--b" />
      <path d="M58 60 Q60 44 70 52" className="ttm-ai-cap__sync-arc" fill="none" />
      <path d="M62 60 Q60 76 50 68" className="ttm-ai-cap__sync-arc" fill="none" />
      <circle cx="60" cy="60" r="6" className="ttm-ai-cap__core" />
    </svg>
  )
}

export function AiCapabilitiesSection() {
  const reduce = useReducedMotion()

  return (
    <section id="ai" className="ttm-ai-section ttm-ai-capabilities" aria-labelledby="ai-cap-title">
      <div className="ttm-ai-container">
        <motion.p
          className="ttm-ai-section__eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.p>
        <motion.h2
          id="ai-cap-title"
          className="ttm-ai-section__title"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Connection isn&apos;t random. It&apos;s measurable.
        </motion.h2>

        <ul className="ttm-ai-capabilities__grid">
          {CAPABILITIES.map((cap, i) => (
            <motion.li
              key={cap.id}
              className="ttm-ai-capabilities__card"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ttm-ai-capabilities__visual">
                <CapabilityVisual type={cap.visual} />
              </div>
              <h3 className="ttm-ai-capabilities__name">{cap.title}</h3>
              <p className="ttm-ai-capabilities__hint">{cap.hint}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
