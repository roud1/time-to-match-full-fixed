"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "motion/react"
import { pickPlatformPresenceLine } from "@/lib/companion/platform-presence"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type CompanionPlatformWhisperProps = {
  className?: string
}

/** Subtle platform presence on shell — not an assistant. */
export function CompanionPlatformWhisper({ className }: CompanionPlatformWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const line = useMemo(() => pickPlatformPresenceLine(), [])

  return (
    <motion.p
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className={cn("p15-platform-whisper", className)}
      role="status"
      aria-live="polite"
    >
      {t(line.textKey)}
    </motion.p>
  )
}
