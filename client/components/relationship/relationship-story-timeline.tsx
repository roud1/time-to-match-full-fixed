"use client"

import { motion, useReducedMotion } from "motion/react"
import type { RelationshipMoment } from "@/client/lib/relationship-identity/types"
import { cn } from "@/client/lib/utils"

type RelationshipStoryTimelineProps = {
  moments: RelationshipMoment[]
  className?: string
}

export function RelationshipStoryTimeline({ moments, className }: RelationshipStoryTimelineProps) {
  const reduce = useReducedMotion()
  const reached = moments.filter((m) => m.reached)

  if (reached.length === 0) return null

  return (
    <ol className={cn("rel-story-timeline", className)}>
      {reached.map((m, i) => (
        <motion.li
          key={m.id}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, duration: 0.45 }}
          className={cn(
            "rel-story-timeline__item",
            m.reached && "rel-story-timeline__item--reached",
            m.importance >= 0.88 && "rel-story-timeline__item--peak"
          )}
        >
          <span className="rel-story-timeline__dot" aria-hidden />
          <p className="text-[11px] font-extralight text-white/75 leading-snug pl-1">{m.title}</p>
          {m.subtitle && (
            <p className="text-[9px] font-extralight text-white/38 mt-0.5 pl-1 italic">
              {m.subtitle}
            </p>
          )}
        </motion.li>
      ))}
    </ol>
  )
}
