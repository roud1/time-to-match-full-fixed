"use client"

import { useRef } from "react"
import { DatingParallaxLayer } from "@/components/landing/dating/dating-parallax-layer"
import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useSectionParallaxY } from "@/hooks/use-parallax"
import { useI18n } from "@/lib/i18n"

const STAT_DEPTHS = [0.3, 0.5, 0.4, 0.6] as const

function ProofStat({
  value,
  label,
  depthIndex,
}: {
  value: string
  label: string
  depthIndex: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const y = useSectionParallaxY(ref, [-14, 14], STAT_DEPTHS[depthIndex] ?? 0.4)

  return (
    <DatingParallaxLayer y={y}>
      <div ref={ref} className="ttm-dating-proof__item">
        <p className="ttm-dating-proof__value">{value}</p>
        <p className="ttm-dating-proof__label">{label}</p>
      </div>
    </DatingParallaxLayer>
  )
}

export function DatingSocialProofSection() {
  const { t } = useI18n()

  const items = [
    { value: "24h", label: t("datingHow3Title") },
    { value: "AI", label: t("datingAiEyebrow") },
    { value: "1×", label: t("datingHeroChip1") },
    { value: "∞", label: t("datingAiScoreHint") },
  ]

  return (
    <section className="ttm-dating-proof ttm-dating-section--parallax" aria-label={t("datingHeroChipsAria")}>
      <div className="ttm-dating-container">
        <DatingScrollReveal depth={0.3}>
          <div className="ttm-dating-proof__grid">
            {items.map((item, index) => (
              <ProofStat
                key={item.label}
                value={item.value}
                label={item.label}
                depthIndex={index}
              />
            ))}
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
