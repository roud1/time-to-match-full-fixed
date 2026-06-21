"use client"

import { DatingScrollReveal } from "@/components/landing/dating/dating-scroll-reveal"
import { useI18n } from "@/lib/i18n"

export function DatingSocialProofSection() {
  const { t } = useI18n()

  const items = [
    { value: "24h", label: t("datingHow3Title") },
    { value: "AI", label: t("datingAiEyebrow") },
    { value: "1×", label: t("datingHeroChip1") },
    { value: "∞", label: t("datingAiScoreHint") },
  ]

  return (
    <section className="ttm-dating-proof" aria-label={t("datingHeroChipsAria")}>
      <div className="ttm-dating-container">
        <DatingScrollReveal>
          <div className="ttm-dating-proof__grid">
            {items.map((item) => (
              <div key={item.label} className="ttm-dating-proof__item">
                <p className="ttm-dating-proof__value">{item.value}</p>
                <p className="ttm-dating-proof__label">{item.label}</p>
              </div>
            ))}
          </div>
        </DatingScrollReveal>
      </div>
    </section>
  )
}
