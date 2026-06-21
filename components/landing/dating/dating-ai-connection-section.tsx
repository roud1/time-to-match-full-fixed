"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { DatingSectionOrbs } from "@/components/landing/dating/dating-section-orbs"
import { useSectionParallaxY } from "@/hooks/use-parallax"
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

const CARD_DEPTHS = [0.5, 0.35, 0.65, 0.45, 0.55] as const

function AiFeatureCard({
  children,
  className,
  depthIndex,
}: {
  children: ReactNode
  className: string
  depthIndex: number
}) {
  const ref = useRef<HTMLElement>(null)
  const y = useSectionParallaxY(ref, [-20, 20], CARD_DEPTHS[depthIndex] ?? 0.5)

  return (
    <DatingParallaxLayer y={y}>
      <article ref={ref} className={className}>
        {children}
      </article>
    </DatingParallaxLayer>
  )
}

export function DatingAiConnectionSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
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
      ref={sectionRef}
      id="ai"
      className="ttm-dating-section ttm-dating-section--compact ttm-dating-section--parallax"
      aria-labelledby="dating-ai-title"
    >
      <DatingSectionOrbs variant="coral" />
      <div className="ttm-dating-container">
        <DatingScrollReveal depth={0.45}>
          <p className="ttm-dating-section__eyebrow">{t("datingAiEyebrow")}</p>
          <h2 id="dating-ai-title" className="ttm-dating-section__title">
            {t("datingAiConnectionTitle")}
          </h2>

          <div className="ttm-dating-features__grid">
            <AiFeatureCard className="ttm-dating-feature-card ttm-dating-feature-card--main" depthIndex={0}>
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
            </AiFeatureCard>

            <AiFeatureCard className="ttm-dating-feature-card ttm-dating-feature-card--side" depthIndex={1}>
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
            </AiFeatureCard>

            {SIGNAL_KEYS.map((key, index) => (
              <AiFeatureCard
                key={key}
                className="ttm-dating-feature-card ttm-dating-feature-card--small"
                depthIndex={index + 2}
              >
                <p className="ttm-dating-flow__step-title">{t(key)}</p>
                <p className="ttm-dating-flow__step-text">{t("datingAiScoreHint")}</p>
              </AiFeatureCard>
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
