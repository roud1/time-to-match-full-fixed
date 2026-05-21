"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEvolutionEvents } from "@/hooks/use-evolution-events"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function EvolutionEventCelebration() {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const { pending, dismiss } = useEvolutionEvents()

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          className="p13-evolution-celebration"
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          data-rarity={pending.rarity}
        >
          <div className="p13-evolution-celebration__glow" aria-hidden />
          <p className="p13-evolution-celebration__eyebrow">{t("netEventEyebrow")}</p>
          <p className="p13-evolution-celebration__title">{t(pending.titleKey)}</p>
          <p className="p13-evolution-celebration__body">{t(pending.bodyKey)}</p>
          <button
            type="button"
            onClick={dismiss}
            className={cn(
              "mt-4 w-full py-2.5 rounded-xl border border-white/12",
              "text-xs font-light text-white/70 hover:border-indigo-400/30 transition-colors"
            )}
          >
            {t("netEventDismiss")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
