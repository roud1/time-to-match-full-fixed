"use client"

import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { UrgencyRing } from "@/client/components/experience/primitives/urgency-ring"

const AVATAR_GRADIENTS = [
  "linear-gradient(145deg, #ff2e63 0%, #6c5ce7 100%)",
  "linear-gradient(145deg, #6c5ce7 0%, #00ffa3 100%)",
] as const

export function ZoneImmersion() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [synced, setSynced] = useState(false)
  const [pulse, setPulse] = useState(0)

  const handleTap = () => {
    setSynced(true)
    setPulse((p) => p + 1)
    window.setTimeout(() => setSynced(false), 2400)
  }

  return (
    <section className="xp-zone xp-zone--offset-right" aria-label={t("ttmXpImmersionLive")}>
      <p className="xp-label mb-[var(--xp-3)]">{t("ttmXpImmersionLive")}</p>

      <button
        type="button"
        onClick={handleTap}
        className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--xp-green)]"
      >
        <GlassPanel depth={2} className="relative overflow-hidden p-[var(--xp-5)] sm:p-[var(--xp-6)]">
          <div className="xp-asymmetric">
            <div className="relative flex min-h-[220px] items-center justify-center">
              <motion.div
                key={pulse}
                className="absolute inset-0 rounded-[var(--xp-radius-md)] bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,163,0.15),transparent_65%)]"
                initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                animate={synced ? { opacity: 1, scale: 1.1 } : { opacity: 0.3, scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="relative flex items-center gap-4 sm:gap-6">
                {AVATAR_GRADIENTS.map((grad, i) => (
                  <motion.div
                    key={i}
                    className="relative h-16 w-16 rounded-2xl border border-white/15 sm:h-20 sm:w-20"
                    style={{ background: grad }}
                    animate={
                      synced && !reduce
                        ? { x: i === 0 ? 12 : -12, scale: 1.05 }
                        : { x: 0, scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  >
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[var(--xp-base)] bg-[var(--xp-green)]" />
                  </motion.div>
                ))}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--xp-green)] to-transparent sm:w-16"
                  animate={synced ? { scaleX: 1.4, opacity: 1 } : { scaleX: 0.6, opacity: 0.4 }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-center gap-[var(--xp-3)]">
              <NeonText as="h2" variant="green" className="text-2xl font-bold sm:text-3xl">
                {synced ? t("ttmXpImmersionMatched") : t("ttmXpImmersionSync")}
              </NeonText>
              <p className="text-sm text-[var(--xp-text-muted)] sm:text-base">
                {synced ? t("ttmXpImmersionExpires") : t("ttmXpImmersionTap")}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <UrgencyRing totalSeconds={23 * 3600 + 14 * 60 + 52} size={88} criticalBelow={7200} />
                <span className="text-xs uppercase tracking-widest text-[var(--xp-text-dim)]">
                  {t("ttmXpImmersionTimer")}
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>
      </button>
    </section>
  )
}
