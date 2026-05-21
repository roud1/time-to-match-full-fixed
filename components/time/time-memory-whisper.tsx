"use client"

import { motion, useReducedMotion } from "motion/react"
import type { TimeMemoryFragment } from "@/lib/time"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type TimeMemoryWhisperProps = {
  memory: TimeMemoryFragment
  className?: string
}

export function TimeMemoryWhisper({ memory, className }: TimeMemoryWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.blockquote
      key={memory.id}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn("p17-time-memory", className)}
      style={{ ["--time-mem-weight" as string]: String(memory.weight) }}
    >
      <p className="p17-time-memory__head">{t(memory.headlineKey)}</p>
      <p className="p17-time-memory__body">{t(memory.bodyKey)}</p>
    </motion.blockquote>
  )
}
