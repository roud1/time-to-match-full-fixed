"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useDatingConnectionDemo } from "@/components/landing/dating/use-dating-profiles"
import { useI18n, type TranslationKey } from "@/lib/i18n"

const STEPS: { num: string; titleKey: TranslationKey; textKey: TranslationKey }[] = [
  { num: "01", titleKey: "datingHow1Title", textKey: "datingHow1Text" },
  { num: "02", titleKey: "datingHow2Title", textKey: "datingHow2Text" },
  { num: "03", titleKey: "datingHow3Title", textKey: "datingHow3Text" },
]

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

export function DatingMatchFlowSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const scoreRef = useRef<HTMLDivElement>(null)
  const inView = useInView(scoreRef, { once: true, margin: "-60px" })
  const demo = useDatingConnectionDemo()
  const counted = useCountUp(demo.connectionScore, inView && !reduce)
  const score = reduce ? (inView ? demo.connectionScore : 0) : counted

  return (
    <section
      id="how"
      className="ttm-dating-section ttm-dating-section--compact ttm-dating-flow"
      aria-labelledby="dating-flow-title"
    >
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <p className="ttm-dating-section__eyebrow">{t("datingHowTitle")}</p>
          <h2 id="dating-flow-title" className="ttm-dating-section__title">
            {t("datingFlowTitle")}
          </h2>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.08}>
          <ol className="ttm-dating-flow__steps">
            {STEPS.map((step, index) => (
              <li key={step.num}>
                <motion.article
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
              </li>
            ))}
          </ol>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.15}>
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
        </DatingScrollReveal>
      </div>
    </section>
  )
}
