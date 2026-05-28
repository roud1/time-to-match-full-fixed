"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function hoursLeftToday() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const ms = Math.max(0, end.getTime() - now.getTime())
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return { h, m, s }
}

export function PremiumUrgencySection() {
  const reduce = useReducedMotion()
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 })

  useEffect(() => {
    setTime(hoursLeftToday())
    const id = window.setInterval(() => setTime(hoursLeftToday()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="ttm-premium-section ttm-premium-urgency" aria-labelledby="urgency-title">
      <div className="ttm-premium-urgency__glow" aria-hidden />
      <div className="ttm-premium-container ttm-premium-urgency__inner">
        <motion.div
          className="ttm-premium-urgency__clock"
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
        >
          <span className="ttm-premium-urgency__digit">{pad(time.h)}</span>
          <span className="ttm-premium-urgency__sep">:</span>
          <span className="ttm-premium-urgency__digit">{pad(time.m)}</span>
          <span className="ttm-premium-urgency__sep ttm-premium-urgency__sep--blink">:</span>
          <span className="ttm-premium-urgency__digit">{pad(time.s)}</span>
        </motion.div>
        <motion.h2
          id="urgency-title"
          className="ttm-premium-urgency__title"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          Time doesn&apos;t wait.
          <br />
          Neither should you.
        </motion.h2>
        <motion.p
          className="ttm-premium-urgency__lead"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.14 }}
        >
          Every match is a countdown. No extensions. No second chances.
        </motion.p>
      </div>
    </section>
  )
}
