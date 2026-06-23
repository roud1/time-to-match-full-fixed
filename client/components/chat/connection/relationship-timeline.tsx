"use client"

import { motion, useReducedMotion } from "motion/react"
import type { TimelineMilestone, TimelineMilestoneId } from "@/client/lib/connection-timeline"
import { useI18n } from "@/client/lib/i18n"
import type { TranslationKey } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

const MILESTONE_KEY: Record<TimelineMilestoneId, TranslationKey> = {
  first_message: "milestoneFirstMessage",
  first_night_talk: "milestoneFirstNight",
  connection_24h: "milestone24h",
  deep_conversation: "milestoneDeep",
  sync_increased: "milestoneSyncIncreased",
  strong_sync: "milestoneStrongSync",
  consistent_replies: "milestoneConsistentReplies",
}

type RelationshipTimelineProps = {
  milestones: TimelineMilestone[]
  className?: string
}

export function RelationshipTimeline({ milestones, className }: RelationshipTimelineProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (milestones.length === 0) return null

  const reached = milestones.filter((m) => m.reached).length
  const fillPercent = milestones.length > 1 ? (reached / milestones.length) * 100 : reached ? 100 : 0

  return (
    <div className={cn("relationship-timeline", className)}>
      <div className="relationship-timeline__track" aria-hidden>
        <motion.div
          className="relationship-timeline__track-fill"
          initial={false}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ul className="flex items-start justify-between gap-1 relative z-[1]">
        {milestones.map((m, i) => (
          <motion.li
            key={m.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className={cn(
              "relationship-timeline__node",
              m.reached && "relationship-timeline__node--reached"
            )}
          >
            <span className="relationship-timeline__dot" aria-hidden />
            <span className="relationship-timeline__label">{t(MILESTONE_KEY[m.id])}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
