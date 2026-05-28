"use client"

import Image from "next/image"
import { motion, useReducedMotion, useInView } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Heart } from "lucide-react"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useDatingConnectionDemo } from "@/components/landing/dating/use-dating-profiles"
import { useI18n } from "@/lib/i18n"

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

export function DatingConnectionSection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const demo = useDatingConnectionDemo()
  const counted = useCountUp(demo.connectionScore, inView && !reduce)
  const score = reduce ? (inView ? demo.connectionScore : 0) : counted

  return (
    <section
      id="connection"
      className="ttm-dating-section ttm-dating-section--compact ttm-dating-connection"
      aria-labelledby="dating-connection-heading"
    >
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <motion.div
            ref={ref}
            className="ttm-dating-connection__panel"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ttm-dating-connection__avatars" aria-hidden>
              <div className="ttm-dating-connection__avatar ttm-dating-connection__avatar--you">
                <span>{t("datingConnectionYou")}</span>
              </div>
              <span className="ttm-dating-connection__link-icon">
                <Heart size={18} fill="currentColor" />
              </span>
              <div className="ttm-dating-connection__avatar ttm-dating-connection__avatar--them">
                <Image
                  src={demo.imageUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="ttm-dating-connection__avatar-img"
                />
              </div>
            </div>

            <div className="ttm-dating-connection__body">
              <p id="dating-connection-heading" className="ttm-dating-connection__pair">
                {t("datingConnectionPair").replace("{name}", demo.matchName)}
              </p>
              <p className="ttm-dating-connection__score" aria-live="polite">
                {t("datingConnectionScoreFmt").replace("{score}", String(score))}
              </p>
            </div>
          </motion.div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
