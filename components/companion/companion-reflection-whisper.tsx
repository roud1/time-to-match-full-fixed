"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import type { RelationshipReflection } from "@/lib/companion"
import { acknowledgeReflection } from "@/lib/companion"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type CompanionReflectionWhisperProps = {
  profileId: number
  reflection: RelationshipReflection
  className?: string
}

export function CompanionReflectionWhisper({
  profileId,
  reflection,
  className,
}: CompanionReflectionWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)

  const dismiss = () => {
    acknowledgeReflection(profileId)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={reflection.id}
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn("p15-reflection-whisper", className)}
          role="note"
        >
          <p className="p15-reflection-whisper__eyebrow">{t("compReflectEyebrow")}</p>
          <p className="p15-reflection-whisper__main">{t(reflection.textKey)}</p>
          {reflection.subKey && (
            <p className="p15-reflection-whisper__sub">{t(reflection.subKey)}</p>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="p15-reflection-whisper__dismiss"
            aria-label={t("compReflectDismiss")}
          >
            {t("compReflectDismiss")}
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
