"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import type { DailyReturnInsight } from "@/lib/shared/daily-return"
import { X } from "lucide-react"

type DailyReturnBannerProps = {
  insights: DailyReturnInsight[]
  open: boolean
  onDismiss: () => void
}

export function DailyReturnBanner({ insights, open, onDismiss }: DailyReturnBannerProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const top = insights[0]
  if (!top) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p10-daily-return relative z-30 max-w-lg mx-auto"
          role="status"
        >
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1.5 text-white/40 hover:text-white/70"
            aria-label={t("dailyReturnDismiss")}
          >
            <X className="w-4 h-4" strokeWidth={1.25} />
          </button>
          <p className="text-[10px] uppercase tracking-[0.28em] text-indigo-200/70 font-extralight mb-2">
            {t("dailyReturnEyebrow")}
          </p>
          <p className="text-sm font-extralight text-white/90 mb-1">{t(top.titleKey)}</p>
          <p className="text-xs font-light text-white/50 leading-relaxed pr-6">{t(top.bodyKey)}</p>
          {insights.length > 1 && (
            <p className="text-[10px] text-white/35 font-light mt-2">
              +{insights.length - 1} {t("dailyReturnMore")}
            </p>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
