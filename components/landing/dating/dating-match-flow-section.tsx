"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { DatingSectionOrbs } from "@/components/landing/dating/dating-section-orbs"
import { useDatingConnectionDemo } from "@/components/landing/dating/use-dating-profiles"
import { useSectionParallaxY } from "@/hooks/use-parallax"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const STEPS: { num: string; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { num: "01", titleKey: "datingHow1Title", textKey: "datingHow1Text" },
  { num: "02", titleKey: "datingHow2Title", textKey: "datingHow2Text" },
  { num: "03", titleKey: "datingHow3Title", textKey: "datingHow3Text" },
]

const STEP_DEPTHS = [0.35, 0.55, 0.75] as const

function useCountUp(target: number, active: boolean, duration = 2000) {
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
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])

  return value
}

function FlowStep({
  step,
  index,
  reduce,
  t,
}: {
  step: (typeof STEPS)[number]
  index: number
  reduce: boolean | null
  t: ReturnType<typeof useI18n>["t"]
}) {
  const ref = useRef<HTMLElement>(null)
  const parallaxY = useSectionParallaxY(ref, [-22, 22], STEP_DEPTHS[index] ?? 0.5)

  return (
    <li>
      <DatingParallaxLayer y={parallaxY}>
        <motion.article
          ref={ref}
          className="ttm-dating-flow__step"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.45,
            delay: index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="ttm-dating-flow__step-num">{step.num}</span>
          <h3 className="ttm-dating-flow__step-title">{t(step.titleKey)}</h3>
          <p className="ttm-dating-flow__step-text">{t(step.textKey)}</p>
        </motion.article>
      </DatingParallaxLayer>
    </li>
  )
}

export function DatingMatchFlowSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const inView = useInView(scoreRef, { once: true, margin: "-60px" })
  const demo = useDatingConnectionDemo()
  const counted = useCountUp(demo.connectionScore, inView && !reduce)
  const score = reduce ? (inView ? demo.connectionScore : 0) : counted
  const scorePanelY = useSectionParallaxY(sectionRef, [-18, 18], 0.45)

  return (
    <section
      ref={sectionRef}
      id="how"
      className="ttm-dating-section ttm-dating-section--compact ttm-dating-flow ttm-dating-section--parallax"
      aria-labelledby="dating-flow-title"
    >
      <DatingSectionOrbs variant="mixed" />
      <div className="ttm-dating-container">
        <DatingScrollReveal depth={0.4}>
          <p className="ttm-dating-section__eyebrow">{t("datingHowTitle")}</p>
          <h2 id="dating-flow-title" className="ttm-dating-section__title">
            {t("datingFlowTitle")}
          </h2>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.08} depth={0.25}>
          <ol className="ttm-dating-flow__steps">
            {STEPS.map((step, index) => (
              <FlowStep key={step.num} step={step} index={index} reduce={reduce} t={t} />
            ))}
          </ol>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.15} depth={0.35}>
          <DatingParallaxLayer y={scorePanelY}>
            <div ref={scoreRef} className="ttm-dating-flow__score-panel">
              <div>
                <p className="ttm-dating-flow__score-value" aria-live="polite">
                  {score}%
                </p>
                <p className="ttm-dating-flow__score-meta">
                  {t("datingConnectionPair").replace("{name}", demo.matchName)}
                </p>
              </div>
              <p className="ttm-dating-flow__score-meta">{t("datingConnectionScoreCaption")}</p>
            </div>
          </DatingParallaxLayer>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
