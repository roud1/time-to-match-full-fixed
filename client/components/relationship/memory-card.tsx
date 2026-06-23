"use client"

import { motion, useReducedMotion } from "motion/react"
import type { RelationshipMoment } from "@/client/lib/relationship-identity/types"
import { formatChatMessageTime } from "@/client/lib/format-chat-time"
import type { Locale } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type MemoryCardProps = {
  moment: RelationshipMoment
  locale: Locale
  featured?: boolean
  className?: string
}

export function MemoryCard({ moment, locale, featured, className }: MemoryCardProps) {
  const reduce = useReducedMotion()
  const time = formatChatMessageTime(moment.at, locale)

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
      className={cn(
        "rel-memory-card px-4 py-3",
        featured && "ring-1 ring-white/10",
        !moment.reached && "opacity-50",
        className
      )}
    >
      {!reduce && <span className="rel-memory-card__shimmer" aria-hidden />}
      <div className="relative z-[1]">
        <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-extralight mb-1">
          {time}
        </p>
        <p className="text-[13px] font-extralight text-white/88 leading-snug">{moment.title}</p>
        {moment.subtitle && (
          <p className="text-[10px] font-extralight text-white/42 mt-1 leading-relaxed italic">
            {moment.subtitle}
          </p>
        )}
      </div>
    </motion.article>
  )
}
