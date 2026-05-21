"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { EmotionalReflectionV2 } from "@/lib/emotional-consciousness"
import { markReflectionV2Shown } from "@/lib/emotional-consciousness"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type ReflectionV2WhisperProps = {
  reflection: EmotionalReflectionV2
  profileId?: number
  className?: string
}

export function ReflectionV2Whisper({
  reflection,
  profileId,
  className,
}: ReflectionV2WhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)

  const dismiss = () => {
    markReflectionV2Shown(reflection.scope, profileId)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.p
          key={reflection.id}
          initial={reduce ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn("ec-reflection-whisper", className)}
          role="note"
        >
          {t(reflection.textKey)}
          <button
            type="button"
            className="ec-reflection-whisper__dismiss"
            onClick={dismiss}
            aria-label={t("ecReflectDismiss")}
          >
            ·
          </button>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
