"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((s) => (s <= 0 ? initialSeconds : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [initialSeconds])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  const progress = seconds / initialSeconds

  return { label, progress }
}

export function SolutionSection() {
  const reduce = useReducedMotion()
  const { label, progress } = useCountdown(23 * 3600 + 41 * 60 + 8)

  return (
    <section id="solution" className="ttm-landing-section" aria-labelledby="solution-title">
      <div className="ttm-landing-container ttm-landing-split">
        <motion.div
          className="ttm-landing-glass ttm-landing-glass--glow ttm-landing-countdown"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-landing-countdown__label">Match expires in</p>
          <p className="ttm-landing-countdown__time" aria-live="polite">
            {label}
          </p>
          <div className="ttm-landing-countdown__bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="ttm-landing-countdown__bar-fill"
              animate={{ scaleX: progress }}
              transition={{ duration: 0.4, ease: "linear" }}
              style={{ width: "100%" }}
            />
          </div>
          <p className="ttm-landing-countdown__hint">
            When the timer hits zero, this match is gone — no second chances.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="ttm-landing-eyebrow">The solution</p>
          <h2 id="solution-title" className="ttm-landing-title ttm-landing-title--section">
            24 hours to make it count
          </h2>
          <p className="ttm-landing-sub" style={{ marginTop: "1rem" }}>
            Every match comes with a live countdown. The urgency isn't a gimmick — it's the feature
            that turns matches into conversations and conversations into connections.
          </p>
          <ul className="ttm-landing-pain-list" style={{ marginTop: "1.5rem" }}>
            <li className="ttm-landing-pain-item">
              <span className="ttm-landing-pain-item__icon" aria-hidden>
                ⏱
              </span>
              <p className="ttm-landing-pain-item__text">
                Real-time timer visible on every match — you always know how much time is left.
              </p>
            </li>
            <li className="ttm-landing-pain-item">
              <span className="ttm-landing-pain-item__icon" aria-hidden>
                🔥
              </span>
              <p className="ttm-landing-pain-item__text">
                Urgency creates momentum. People actually reply when the clock is ticking.
              </p>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
