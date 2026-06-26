"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"

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
      <NeonText as="h2" id="xp-proof-title" variant="green" className="mb-[var(--xp-5)] text-2xl font-bold">
        {t("ttmXpProofWindow")}
      </NeonText>

      <div className="grid gap-[var(--xp-4)] sm:grid-cols-3">
        <GlassPanel depth={1} className="p-[var(--xp-4)]">
          <motion.p
            className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-green)]"
            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {online}
          </motion.p>
          <p className="mt-1 text-xs text-[var(--xp-text-muted)]">{t("ttmXpProofActive")}</p>
        </GlassPanel>

        <GlassPanel depth={1} className="p-[var(--xp-4)]">
          <p className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-purple)]">
            {nearby}
          </p>
          <p className="mt-1 text-xs text-[var(--xp-text-muted)]">{t("ttmXpProofNearby")}</p>
        </GlassPanel>

        <GlassPanel depth={2} className="border-[var(--xp-pink)]/20 p-[var(--xp-4)]">
          <p className="font-[family-name:var(--xp-font-display)] text-3xl font-bold tabular-nums text-[var(--xp-pink)]">
            {slots}
          </p>
          <p className="mt-1 text-xs text-[var(--xp-text-muted)]">{t("ttmXpProofScarcity")}</p>
          <div className="mt-3 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 flex-1 rounded-full bg-[var(--xp-pink)]/80"
                animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, delay: i * 0.25, repeat: Infinity }}
              />
            ))}
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}
