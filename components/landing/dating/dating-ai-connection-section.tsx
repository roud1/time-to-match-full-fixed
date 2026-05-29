"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const CYCLE_KEYS: TranslationKey[] = [
  "datingAiCycle1",
  "datingAiCycle2",
  "datingAiCycle3",
  "datingAiCycle4",
]

const SIGNAL_KEYS: TranslationKey[] = [
  "datingAiSignal1",
  "datingAiSignal2",
  "datingAiSignal3",
]

export function DatingAiConnectionSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [cycleIndex, setCycleIndex] = useState(0)
  const [score, setScore] = useState(84)

  useEffect(() => {
    const cycleId = window.setInterval(() => {
      setCycleIndex((value) => (value + 1) % CYCLE_KEYS.length)
    }, 2400)
    return () => window.clearInterval(cycleId)
  }, [])

  useEffect(() => {
    const scoreId = window.setInterval(() => {
      setScore((value) => {
        const next = value + (Math.random() > 0.5 ? 1 : -1)
        return Math.min(89, Math.max(85, next))
      })
    }, 2800)
    return () => window.clearInterval(scoreId)
  }, [])

  return (
    <section
      id="ai"
      className="ttm-dating-section ttm-dating-section--compact ttm-dating-ai"
      aria-labelledby="dating-ai-title"
    >
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow ttm-dating-section__eyebrow--left">
            {t("datingAiEyebrow")}
          </p>
          <h2 id="dating-ai-title" className="ttm-dating-ai__title">
            {t("datingAiConnectionTitle")}
          </h2>

          <div className="ttm-dating-ai__panel">
            <div className="ttm-dating-ai__main">
              <div className="ttm-dating-ai__scan" aria-hidden>
                <motion.div
                  className="ttm-dating-ai__scan-bar"
                  animate={reduce ? undefined : { x: ["-100%", "100%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={CYCLE_KEYS[cycleIndex]}
                  className="ttm-dating-ai__status"
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {t(CYCLE_KEYS[cycleIndex])}
                </motion.p>
              </AnimatePresence>

              <ul className="ttm-dating-ai__chips" aria-label={t("datingAiChipsAria")}>
                {SIGNAL_KEYS.map((key) => (
                  <li key={key} className="ttm-dating-ai__chip">
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ttm-dating-ai__score" aria-live="polite">
              <span className="ttm-dating-ai__live">
                <span className="ttm-dating-ai__live-dot" aria-hidden />
                {t("datingAiLiveLabel")}
              </span>
              <p className="ttm-dating-ai__score-label">{t("datingAiOutputLabel")}</p>
              <motion.p
                className="ttm-dating-ai__score-value"
                key={score}
                initial={reduce ? false : { opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {score}%
              </motion.p>
              <p className="ttm-dating-ai__score-hint">{t("datingAiScoreHint")}</p>
            </div>
          </div>

          <div className="ttm-dating-ai__cta-wrap">
            <Link href="/register" className="ttm-dating-cta ttm-dating-cta--ghost ttm-dating-ai__cta">
              {t("datingAiCta")}
            </Link>
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
