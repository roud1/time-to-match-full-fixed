"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEnergyFeed } from "@/hooks/use-energy-feed"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function EnergyFeedWhisper({ className }: { className?: string }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const whisper = useEnergyFeed()

  if (!whisper) return null

  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p13-energy-whisper", className)}
      role="status"
    >
      <span className="p13-energy-whisper__dot" aria-hidden />
      {t(whisper.messageKey)}
    </motion.p>
  )
}
