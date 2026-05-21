"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { RelationshipNarrative } from "@/lib/reality-expansion"
import { markRealityNarrativeShown } from "@/lib/reality-expansion"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type RelationshipNarrativeWhisperProps = {
  narrative: RelationshipNarrative
  profileId?: number
  className?: string
}

export function RelationshipNarrativeWhisper({
  narrative,
  profileId,
  className,
}: RelationshipNarrativeWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)

  const dismiss = () => {
    markRealityNarrativeShown(narrative.scope, profileId)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.p
          key={narrative.id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn("er-narrative-whisper", className)}
          role="note"
        >
          {t(narrative.textKey)}
          <button
            type="button"
            className="er-narrative-whisper__dismiss"
            onClick={dismiss}
            aria-label={t("erNarrativeDismiss")}
          >
            ·
          </button>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
