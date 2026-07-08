"use client"

import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react"
import { useState } from "react"
import { useI18n } from "@/client/lib/i18n"
import { GlassPanel } from "@/client/components/experience/primitives/glass-panel"
import { NeonText } from "@/client/components/experience/primitives/neon-text"
import { ParallaxDepth } from "@/client/components/experience/primitives/parallax-depth"
import { ZoneGlow } from "@/client/components/experience/primitives/zone-glow"
import { SpotlightCard } from "@/client/components/experience/primitives/spotlight-card"

const DECK = [
  { id: 1, vibe: "92%", hue: "from-[#ff2e63] to-[#6c5ce7]" },
  { id: 2, vibe: "87%", hue: "from-[#6c5ce7] to-[#00ffa3]" },
  { id: 3, vibe: "78%", hue: "from-[#00ffa3] to-[#6c5ce7]" },
] as const

const SWIPE_THRESHOLD = 90

export function ZoneMotion() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(3)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-180, 0, 180], [-12, 0, 12])
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0])

  const card = DECK[index % DECK.length]

  const dismiss = (dir: "left" | "right") => {
    setLeft((n) => Math.max(0, n - 1))
    setIndex((i) => i + 1)
    x.set(dir === "right" ? 400 : -400)
    window.setTimeout(() => x.set(0), 280)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) dismiss("right")
    else if (info.offset.x < -SWIPE_THRESHOLD) dismiss("left")
  }

  return (
    <section className="xp-zone" aria-labelledby="xp-motion-title">
      <ZoneGlow variant="purple" position="top-left" size="md" />
      <div className="mb-[var(--xp-5)] flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="xp-label mb-[var(--xp-2)]">{t("ttmXpMotionTitle")}</p>
          <NeonText as="h2" id="xp-motion-title" variant="purple" className="text-2xl font-bold sm:text-3xl">
            {left} {t("ttmXpMotionLeft")}
          </NeonText>
        </div>
        <span className="rounded-full border border-[var(--xp-amber)]/30 bg-[var(--xp-amber)]/10 px-3 py-1 text-xs font-semibold text-[var(--xp-amber)]">
          {t("ttmXpMotionScarcity")}
        </span>
      </div>

      <ParallaxDepth depth={2}>
      <SpotlightCard className="mx-auto max-w-sm">
      <GlassPanel depth={2} className="relative mx-auto max-w-sm overflow-hidden p-[var(--xp-5)] xp-float-card">
        <div className="relative mx-auto h-[340px] w-full max-w-[280px]">
          {left === 0 ? (
            <div className="xp-dissolve flex h-full flex-col items-center justify-center text-center">
              <NeonText variant="pink" className="text-lg font-semibold">
                {t("ttmXpMotionEmpty")}
              </NeonText>
            </div>
          ) : (
            <motion.div
              key={`${card.id}-${index}`}
              className={`absolute inset-0 cursor-grab touch-pan-y rounded-[var(--xp-radius-md)] bg-gradient-to-br ${card.hue} p-[var(--xp-4)] active:cursor-grabbing`}
              style={{ x, rotate }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={onDragEnd}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <motion.span
                className="absolute left-4 top-4 rounded-md border-2 border-[var(--xp-green)] px-2 py-1 text-xs font-bold uppercase text-[var(--xp-green)]"
                style={{ opacity: likeOpacity }}
              >
                {t("ttmXpMotionLike")}
              </motion.span>
              <motion.span
                className="absolute right-4 top-4 rounded-md border-2 border-[var(--xp-pink)] px-2 py-1 text-xs font-bold uppercase text-[var(--xp-pink)]"
                style={{ opacity: passOpacity }}
              >
                {t("ttmXpMotionPass")}
              </motion.span>
              <div className="mt-auto flex flex-col gap-1">
                <span className="text-4xl font-black text-white/90">{card.vibe}</span>
                <span className="text-xs uppercase tracking-widest text-white/60">{t("ttmXpMotionVibe")}</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-[var(--xp-4)] flex justify-center gap-4">
          <button
            type="button"
            onClick={() => dismiss("left")}
            disabled={left === 0}
            className="rounded-full border border-[var(--xp-pink)]/50 px-5 py-2 text-sm font-semibold text-[var(--xp-pink)] disabled:opacity-40"
          >
            {t("ttmXpMotionPass")}
          </button>
          <button
            type="button"
            onClick={() => dismiss("right")}
            disabled={left === 0}
            className="rounded-full border border-[var(--xp-green)]/50 bg-[var(--xp-green)]/10 px-5 py-2 text-sm font-semibold text-[var(--xp-green)] disabled:opacity-40"
          >
            {t("ttmXpMotionLike")}
          </button>
        </div>
      </GlassPanel>
      </SpotlightCard>
      </ParallaxDepth>
    </section>
  )
}
