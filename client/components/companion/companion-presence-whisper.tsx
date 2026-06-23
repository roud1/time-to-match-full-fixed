"use client"

import { motion, useReducedMotion } from "motion/react"
import type { PresenceObservation } from "@/client/lib/companion"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type CompanionPresenceWhisperProps = {
  observation: PresenceObservation
  className?: string
}

export function CompanionPresenceWhisper({ observation, className }: CompanionPresenceWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.p
      key={observation.kind}
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("p15-presence-whisper", className)}
      role="status"
      aria-live="polite"
    >
      <span className="p15-presence-whisper__dot" aria-hidden />
      {t(observation.textKey)}
    </motion.p>
  )
}
