"use client"

import { motion, useReducedMotion } from "motion/react"
import type { ShareMoment } from "@/client/lib/shared/share-moments"
import { ShareSyncCard } from "@/client/components/growth/share-sync-card"
import { cn } from "@/client/lib/utils"

type EmotionalShareCardProps = {
  moment: ShareMoment
  className?: string
  onClose?: () => void
  premium?: boolean
}

/** Premium wrapper for share-worthy emotional cards. */
export function EmotionalShareCard({ moment, className, onClose, premium = true }: EmotionalShareCardProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(premium && "p13-emotional-share-wrap", className)}
      data-share-kind={moment.kind}
    >
      {premium && <div className="p13-emotional-share-wrap__aura" aria-hidden />}
      <ShareSyncCard moment={moment} onClose={onClose} className={premium ? "relative z-[1]" : undefined} />
    </motion.div>
  )
}
