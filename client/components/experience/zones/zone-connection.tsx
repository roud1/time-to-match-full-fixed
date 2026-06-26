"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { ParallaxDepth } from "@/client/components/experience/primitives/parallax-depth"
import { ZoneGlow } from "@/client/components/experience/primitives/zone-glow"

export function ZoneConnection() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [seconds, setSeconds] = useState(47 * 60 + 12)
  const [typing, setTyping] = useState(true)
  const urgent = seconds < 900

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setTyping((v) => !v), 2800)
    return () => window.clearInterval(id)
  }, [])

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  return (
    <section className="xp-zone xp-zone--offset-right" aria-labelledby="xp-connection-title">
      <ZoneGlow variant="purple" position="bottom-right" size="md" />
      <p className="xp-label mb-[var(--xp-3)]">{t("ttmXpConnectionTitle")}</p>

      <ParallaxDepth depth={2}>
      <GlassPanel depth={2} className="overflow-hidden">
        <div
          className={`flex items-center justify-between border-b border-white/8 px-[var(--xp-4)] py-[var(--xp-3)] ${urgent ? "bg-[var(--xp-pink)]/10" : "bg-white/[0.03]"}`}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--xp-green)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--xp-text-muted)]">
              {typing ? t("ttmXpConnectionTyping") : t("ttmXpConnectionUrgent")}
            </span>
          </div>
          <motion.span
            className="font-mono text-sm font-bold tabular-nums text-[var(--xp-pink)]"
            animate={urgent && !reduce ? { opacity: [1, 0.5, 1] } : undefined}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {mm}:{ss} {t("ttmXpConnectionTimer")}
          </motion.span>
        </div>

        <div className="space-y-[var(--xp-3)] p-[var(--xp-4)] sm:p-[var(--xp-5)]">
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[var(--xp-purple)]/25 px-4 py-2.5 text-sm text-[var(--xp-text)]">
              {t("ttmXpConnectionMsgYou")}
            </div>
          </div>
          <div className="flex justify-start">
            <motion.div
              className="max-w-[75%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-sm"
              animate={typing && !reduce ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              {t("ttmXpConnectionMsgThem")}
            </motion.div>
          </div>
          {seconds === 0 ? (
            <p className="xp-dissolve text-center text-xs text-[var(--xp-pink)]">{t("ttmXpConnectionExpired")}</p>
          ) : null}
        </div>

        <div className="border-t border-white/8 p-[var(--xp-4)]">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2.5">
            <NeonText as="span" variant="green" className="text-xs opacity-80">
              {t("ttmXpConnectionPlaceholder")}
            </NeonText>
            <span className="ml-auto text-xs font-semibold text-[var(--xp-green)]">{t("ttmXpConnectionSend")}</span>
          </div>
        </div>
      </GlassPanel>
      </ParallaxDepth>
    </section>
  )
}
