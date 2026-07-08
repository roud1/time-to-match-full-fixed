"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { ParallaxDepth } from "@/client/components/experience/primitives/parallax-depth"
import { ZoneGlow } from "@/client/components/experience/primitives/zone-glow"
import { CountUp } from "@/client/components/experience/primitives/count-up"
import { SpotlightCard } from "@/client/components/experience/primitives/spotlight-card"

function useLiveCount(base: number, variance: number) {
  const [n, setN] = useState(base)
  useEffect(() => {
    const id = window.setInterval(() => {
      setN(base + Math.floor(Math.random() * variance) - Math.floor(variance / 2))
    }, 4200)
    return () => window.clearInterval(id)
  }, [base, variance])
  return n
}

export function ZoneProof() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const online = useLiveCount(142, 18)
  const nearby = useLiveCount(23, 8)
  const slots = 3

  return (
    <section className="xp-zone" aria-labelledby="xp-proof-title">
      <ZoneGlow variant="green" position="center" size="lg" />
      <NeonText as="h2" id="xp-proof-title" variant="green" className="mb-[var(--xp-5)] text-2xl font-bold">
        {t("ttmXpProofWindow")}
      </NeonText>

      <div className="grid gap-[var(--xp-4)] sm:grid-cols-3">
        <ParallaxDepth depth={1}>
        <SpotlightCard>
        <GlassPanel depth={1} className="p-[var(--xp-4)] xp-float-card">
          <p className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-green)]">
            <CountUp to={online} duration={1.4} className="ttm-live-number" />
          </p>
          <p className="mt-1 text-sm text-[var(--xp-text-muted)]">{t("ttmXpProofActive")}</p>
        </GlassPanel>
        </SpotlightCard>
        </ParallaxDepth>

        <ParallaxDepth depth={2}>
        <SpotlightCard>
        <GlassPanel depth={2} className="p-[var(--xp-4)] xp-float-card">
          <p className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-pink)]">
            <CountUp to={nearby} duration={1.6} delay={0.2} className="ttm-live-number" />
          </p>
          <p className="mt-1 text-sm text-[var(--xp-text-muted)]">{t("ttmXpProofNearby")}</p>
        </GlassPanel>
        </SpotlightCard>
        </ParallaxDepth>

        <ParallaxDepth depth={1}>
        <SpotlightCard>
        <GlassPanel depth={1} className="p-[var(--xp-4)] xp-float-card">
          <p className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-purple)]">
            <CountUp to={slots} duration={0.9} delay={0.35} />
          </p>
          <p className="mt-1 text-sm text-[var(--xp-text-muted)]">{t("ttmXpProofScarcity")}</p>
        </GlassPanel>
        </SpotlightCard>
        </ParallaxDepth>
      </div>
    </section>
  )
}
