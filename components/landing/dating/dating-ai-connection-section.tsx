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
      className="ttm-dating-section ttm-dating-section--compact"
      aria-labelledby="dating-ai-title"
    >
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingAiEyebrow")}</p>
          <h2 id="dating-ai-title" className="ttm-dating-section__title">
            {t("datingAiConnectionTitle")}
          </h2>

          <div className="ttm-dating-features__grid">
            <article className="ttm-dating-feature-card ttm-dating-feature-card--main">
              <span className="ttm-dating-feature-card__live">
                <span className="ttm-dating-feature-card__live-dot" aria-hidden />
                {t("datingAiLiveLabel")}
              </span>
              <p className="ttm-dating-feature-card__score" aria-live="polite">
                {score}%
              </p>
              <p className="ttm-dating-feature-card__cycle">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cycleIndex}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                  >
                    {t(CYCLE_KEYS[cycleIndex])}
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="ttm-dating-bento-score-label">{t("datingAiScoreHint")}</p>
            </article>

            <article className="ttm-dating-feature-card ttm-dating-feature-card--side">
              <p className="ttm-dating-bento-signal">
                <strong>{t("datingAiWeAnalyze")}</strong>
              </p>
              <ul className="ttm-dating-feature-card__signals" aria-label={t("datingAiChipsAria")}>
                {SIGNAL_KEYS.map((key) => (
                  <li key={key} className="ttm-dating-feature-card__signal">
                    {t(key)}
                  </li>
                ))}
              </ul>
              <p className="ttm-dating-bento-score-label" style={{ marginTop: "1rem" }}>
                {t("datingAiOutputLabel")}: {t("datingAiOutputValue")}
              </p>
            </article>

            {SIGNAL_KEYS.map((key) => (
              <article key={key} className="ttm-dating-feature-card ttm-dating-feature-card--small">
                <p className="ttm-dating-flow__step-title">{t(key)}</p>
                <p className="ttm-dating-flow__step-text">{t("datingAiScoreHint")}</p>
              </article>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <Link href="/register" className="ttm-dating-cta">
              {t("datingAiCta")}
            </Link>
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
