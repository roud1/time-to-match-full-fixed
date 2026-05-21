"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEmotionalRetention } from "@/hooks/use-emotional-retention"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type EmotionalRetentionStripProps = {
  className?: string
}

export function EmotionalRetentionStrip({ className }: EmotionalRetentionStripProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const item = useEmotionalRetention()

  if (!item) return null

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p13-retention-strip", className)}
      data-kind={item.kind}
    >
      <p className="p13-retention-strip__title">{t(item.titleKey)}</p>
      <p className="p13-retention-strip__body">{t(item.bodyKey)}</p>
    </motion.div>
  )
}
