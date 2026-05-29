"use client"

import Image from "next/image"
import { motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Heart } from "lucide-react"
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
          <p className="ttm-dating-section__eyebrow ttm-dating-section__eyebrow--left">
            {t("datingHowTitle")}
          </p>
          <h2 id="dating-flow-title" className="ttm-dating-flow__title">
            {t("datingFlowTitle")}
          </h2>
        </DatingScrollReveal>

        <DatingScrollReveal delay={0.06}>
          <div className="ttm-dating-flow__panel">
            <div ref={scoreRef} className="ttm-dating-flow__connection">
              <div className="ttm-dating-flow__avatars" aria-hidden>
                <div className="ttm-dating-flow__avatar ttm-dating-flow__avatar--you">
                  <span>{t("datingConnectionYou")}</span>
                </div>
                <span className="ttm-dating-flow__heart">
                  <Heart size={18} fill="currentColor" />
                </span>
                <div className="ttm-dating-flow__avatar ttm-dating-flow__avatar--them">
                  <Image
                    src={demo.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="ttm-dating-flow__avatar-img"
                  />
                </div>
              </div>

              <div className="ttm-dating-flow__score-block">
                <p className="ttm-dating-flow__pair">
                  {t("datingConnectionPair").replace("{name}", demo.matchName)}
                </p>
                <p className="ttm-dating-flow__score" aria-live="polite">
                  {t("datingConnectionScoreFmt").replace("{score}", String(score))}
                </p>
                <p className="ttm-dating-flow__score-caption">{t("datingConnectionScoreCaption")}</p>
              </div>
            </div>

            <div className="ttm-dating-flow__divider" aria-hidden />

            <ol className="ttm-dating-flow__steps">
              {STEPS.map((step, index) => (
                <li key={step.num} className="ttm-dating-flow__step-wrap">
                  <motion.article
                    className="ttm-dating-flow__step"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <span className="ttm-dating-flow__num">{step.num}</span>
                    <h3 className="ttm-dating-flow__step-title">{t(step.titleKey)}</h3>
                    <p className="ttm-dating-flow__step-text">{t(step.textKey)}</p>
                  </motion.article>
                  {index < STEPS.length - 1 && (
                    <span className="ttm-dating-flow__arrow" aria-hidden>
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
