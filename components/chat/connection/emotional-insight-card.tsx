"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type EmotionalInsightCardProps = {
  insight: string
  loading?: boolean
  className?: string
}

export function EmotionalInsightCard({ insight, loading, className }: EmotionalInsightCardProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (!insight && !loading) return null

  return (
    <motion.div
      key={insight || "loading"}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn("chat-insight-card relative overflow-hidden rounded-2xl px-3.5 py-2.5", className)}
      role="status"
      aria-live="polite"
    >
      {!reduce && <span className="chat-insight-card__shimmer absolute inset-0 pointer-events-none" aria-hidden />}
      <div className="relative z-[1] flex items-start gap-2.5">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] text-white/50"
          aria-hidden
        >
          ✦
        </span>
        <div className="min-w-0">
          <p className="text-[8px] uppercase tracking-[0.18em] text-white/30 font-extralight mb-0.5">
            {t("chatInsightLabel")}
          </p>
          {loading ? (
            <p className="text-[11px] text-white/40 font-extralight italic animate-pulse">
              {t("syncAnalyzing")}
            </p>
          ) : (
            <p className="text-[11px] text-white/72 font-extralight leading-snug italic">{insight}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
