"use client"

import { motion, useReducedMotion } from "motion/react"
import type { EmotionalState } from "@/lib/connection-engine"
import { useI18n } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type EmotionalStatusProps = {
  state: EmotionalState
  className?: string
}

const STATE_KEY: Record<EmotionalState, TranslationKey> = {
  curious: "emotionCurious",
  warm: "emotionWarm",
  electric: "emotionElectric",
  aligned: "emotionAligned",
  distant: "emotionDistant",
  fading: "emotionFading",
}

const STATE_CLASS: Record<EmotionalState, string> = {
  curious: "text-white/50",
  warm: "text-white/65",
  electric: "text-violet-200/80",
  aligned: "text-emerald-200/75",
  distant: "text-white/40",
  fading: "text-amber-200/65",
}

export function EmotionalStatus({ state, className }: EmotionalStatusProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.div
      key={state}
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5",
        className
      )}
    >
      <span
        className={cn(
          "relative flex h-2 w-2 shrink-0 rounded-full",
          state === "electric" || state === "aligned"
            ? "bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.35)]"
            : "bg-white/35"
        )}
        aria-hidden
      >
        {!reduce && (state === "electric" || state === "aligned") && (
          <span className="absolute inset-0 rounded-full animate-ping bg-white/30 opacity-40" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-[8px] uppercase tracking-[0.16em] text-white/30 font-extralight">
          {t("emotionalStateLabel")}
        </p>
        <p className={cn("text-[10px] font-extralight truncate", STATE_CLASS[state])}>
          {t(STATE_KEY[state])}
        </p>
      </div>
    </motion.div>
  )
}
