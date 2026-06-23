"use client"

import { motion, useReducedMotion } from "motion/react"
import type { CompanionStory } from "@/client/lib/companion"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type CompanionStoryWhisperProps = {
  story: CompanionStory
  className?: string
}

export function CompanionStoryWhisper({ story, className }: CompanionStoryWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <motion.div
      key={story.id}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("p15-story-whisper", className)}
      role="status"
    >
      <p className="p15-story-whisper__head">{t(story.headlineKey)}</p>
      <p className="p15-story-whisper__body">{t(story.bodyKey)}</p>
    </motion.div>
  )
}
