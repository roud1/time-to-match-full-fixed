"use client"

import { useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { UrgencyRing } from "@/client/components/experience/primitives/urgency-ring"

export function ZonePressure() {
  const { t } = useI18n()
  const [shake, setShake] = useState(false)

  return (
    <section className="xp-zone xp-zone--offset-left" aria-labelledby="xp-pressure-title">
      <div className="xp-asymmetric xp-asymmetric--flip">
        <div className="order-2 flex flex-col gap-[var(--xp-4)] md:order-1">
          <p className="xp-label">{t("ttmXpPressureLabel")}</p>
          <NeonText as="h2" id="xp-pressure-title" variant="pink" className="text-3xl font-bold sm:text-4xl">
            {t("ttmXpPressureTitle")}
          </NeonText>
          <p className="max-w-md text-[var(--xp-text-muted)]">{t("ttmXpPressureSubtitle")}</p>
          <p
            className={`text-sm font-medium text-[var(--xp-pink)] ${shake ? "xp-shake" : ""}`}
            onAnimationEnd={() => setShake(false)}
          >
            {t("ttmXpPressureLoss")}
          </p>
        </div>

        <GlassPanel depth={3} className={`order-1 flex justify-center p-[var(--xp-6)] md:order-2 ${shake ? "xp-shake" : ""}`}>
          <UrgencyRing
            totalSeconds={24 * 3600}
            label={t("ttmXpPressureRingLabel")}
            size={260}
            criticalBelow={3600}
            onCritical={() => setShake(true)}
          />
        </GlassPanel>
      </div>
    </section>
  )
}
