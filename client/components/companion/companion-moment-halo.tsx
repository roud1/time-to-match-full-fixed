"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { EmotionalMomentSignal } from "@/client/lib/companion"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type CompanionMomentHaloProps = {
  moment: EmotionalMomentSignal | null
  className?: string
}

export function CompanionMomentHalo({ moment, className }: CompanionMomentHaloProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {moment?.active && (
        <motion.div
          key={moment.kind}
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className={cn("p15-moment-halo", className)}
          style={{ ["--comp-moment-intensity" as string]: String(moment.intensity) }}
          role="status"
          aria-live="polite"
        >
          <span className="p15-moment-halo__ring" aria-hidden />
          <div className="p15-moment-halo__copy">
            <p className="p15-moment-halo__title">{t(moment.titleKey)}</p>
            <p className="p15-moment-halo__body">{t(moment.bodyKey)}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
