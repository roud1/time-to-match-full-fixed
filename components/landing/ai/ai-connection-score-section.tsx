"use client"

import Image from "next/image"
import { motion, useReducedMotion, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"

const TARGET_SCORE = 87
const BULLETS = [
  "Response timing alignment",
  "Emotional signal strength",
  "Mutual engagement depth",
] as const

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }

    let start: number | null = null
    let raf = 0

    const tick = (ts: number) => {
      if (start === null) start = ts
      const t = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])

  return value
}

export function AiConnectionScoreSection() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const score = useCountUp(TARGET_SCORE, inView && !reduce)

  return (
    <section
      id="score"
      className="ttm-ai-section ttm-ai-score"
      aria-labelledby="ai-score-title"
    >
      <div className="ttm-ai-container">
        <motion.p
          className="ttm-ai-section__eyebrow"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Connection Score
        </motion.p>
        <motion.h2
          id="ai-score-title"
          className="ttm-ai-section__title"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Real chemistry, quantified.
        </motion.h2>

        <div ref={ref} className="ttm-ai-score__layout">
          <motion.article
            className="ttm-ai-score__card"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-ai-score__photo">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&h=640&fit=crop&q=85"
                alt=""
                fill
                className="ttm-ai-score__image"
                sizes="(max-width: 768px) 100vw, 380px"
              />
              <div className="ttm-ai-score__photo-shade" aria-hidden />
              <div className="ttm-ai-score__timer">
                <span aria-hidden>⏳</span> 18h left
              </div>
            </div>
            <div className="ttm-ai-score__meta">
              <p className="ttm-ai-score__name">
                Eva <span className="ttm-ai-score__age">, 22</span>
              </p>
              <div className="ttm-ai-score__ring-wrap" aria-hidden>
                <svg viewBox="0 0 120 120" className="ttm-ai-score__ring-svg">
                  <circle cx="60" cy="60" r="52" className="ttm-ai-score__ring-track" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    className="ttm-ai-score__ring-fill"
                    style={{
                      strokeDasharray: `${(score / 100) * 327} 327`,
                    }}
                  />
                </svg>
              </div>
              <p className="ttm-ai-score__label">
                Connection Score:{" "}
                <span className="ttm-ai-score__value">{score}%</span>
              </p>
            </div>
          </motion.article>

          <motion.ul
            className="ttm-ai-score__bullets"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {BULLETS.map((item, i) => (
              <motion.li
                key={item}
                className="ttm-ai-score__bullet"
                initial={reduce ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <span className="ttm-ai-score__bullet-dot" aria-hidden />
                {item}
              </motion.li>
            ))}
            <li className="ttm-ai-score__bullet ttm-ai-score__bullet--note">
              AI updates your score as the conversation evolves — not a static label.
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  )
}
