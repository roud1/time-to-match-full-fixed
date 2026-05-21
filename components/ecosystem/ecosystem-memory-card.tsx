"use client"

import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { STAGE_LABEL_KEYS, type RelationshipEcosystemStage } from "@/lib/ecosystem"
import { cn } from "@/lib/utils"

type EcosystemMemoryCardProps = {
  title: string
  body: string
  dateLabel: string
  stage?: RelationshipEcosystemStage
  featured?: boolean
  className?: string
}

export function EcosystemMemoryCard({
  title,
  body,
  dateLabel,
  stage,
  featured,
  className,
}: EcosystemMemoryCardProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p10-memory-cinematic relative px-4 py-4",
        featured && "ring-1 ring-indigo-400/20",
        className
      )}
      data-eco-stage={stage}
    >
      {stage && (
        <p className="relative text-[9px] uppercase tracking-[0.22em] text-indigo-200/60 font-extralight mb-2">
          {t(STAGE_LABEL_KEYS[stage])}
        </p>
      )}
      <p className="relative text-sm font-extralight text-white/90">{title}</p>
      <p className="relative text-xs font-light text-white/48 mt-1.5 leading-relaxed">{body}</p>
      <p className="relative text-[10px] text-white/30 font-light mt-2 tabular-nums">{dateLabel}</p>
    </motion.article>
  )
}
