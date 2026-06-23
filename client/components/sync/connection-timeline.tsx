"use client"

import { motion, useReducedMotion } from "motion/react"
import type { TimelineMilestone, TimelineMilestoneId } from "@/client/lib/connection-timeline"
import { useI18n } from "@/client/lib/i18n"
import type { TranslationKey } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type ConnectionTimelineProps = {
  milestones: TimelineMilestone[]
  className?: string
  compact?: boolean
}

const MILESTONE_KEY: Record<TimelineMilestoneId, TranslationKey> = {
  first_message: "milestoneFirstMessage",
  first_night_talk: "milestoneFirstNight",
  connection_24h: "milestone24h",
  deep_conversation: "milestoneDeep",
  consistent_replies: "milestoneConsistentReplies",
  sync_increased: "milestoneSyncIncreased",
  strong_sync: "milestoneStrongSync",
}

export function ConnectionTimeline({ milestones, className, compact }: ConnectionTimelineProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  if (milestones.length === 0) return null

  return (
    <ul className={cn("sync-milestones", compact && "sync-milestones--compact", className)}>
      {milestones.map((m, i) => (
        <motion.li
          key={m.id}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className={cn(
            "sync-milestones__item flex items-start gap-2",
            m.reached ? "sync-milestones__item--reached" : "opacity-40"
          )}
        >
          <span
            className={cn(
              "sync-milestones__dot mt-1 shrink-0 rounded-full",
              m.reached ? "bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.25)]" : "bg-white/20"
            )}
            aria-hidden
          />
          <span className="text-[9px] font-extralight text-white/55 leading-snug">
            {t(MILESTONE_KEY[m.id])}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}
