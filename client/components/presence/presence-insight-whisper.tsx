"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { PresenceInsight } from "@/client/lib/presence"
import { markPresenceInsightShown } from "@/client/lib/presence"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type PresenceInsightWhisperProps = {
  profileId: number
  insight: PresenceInsight
  className?: string
}

export function PresenceInsightWhisper({
  profileId,
  insight,
  className,
}: PresenceInsightWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)

  const dismiss = () => {
    markPresenceInsightShown(profileId)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.p
          key={insight.id}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("p18-presence-insight", className)}
          role="note"
        >
          {t(insight.textKey)}
          <button
            type="button"
            className="p18-presence-insight__dismiss"
            onClick={dismiss}
            aria-label={t("presInsightDismiss")}
          >
            ·
          </button>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
