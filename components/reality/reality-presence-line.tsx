"use client"

import { motion, useReducedMotion } from "motion/react"
import type { RealityPresenceLine as RealityLine } from "@/lib/reality"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type RealityPresenceLineProps = {
  line: RealityLine
  className?: string
}

export function RealityPresenceLine({ line, className }: RealityPresenceLineProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.p
      key={line.id}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p16-presence-line", className)}
      role="status"
      aria-live="polite"
    >
      {t(line.textKey)}
    </motion.p>
  )
}
