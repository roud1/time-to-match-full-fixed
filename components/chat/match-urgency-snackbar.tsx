"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
type MatchUrgencySnackbarProps = {
  expiresAt: string
  profileId: number
}

export function MatchUrgencySnackbar({ expiresAt, profileId }: MatchUrgencySnackbarProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const storageKey = `ttm-match-urgency-snack:${profileId}`

  useEffect(() => {
    const remaining = new Date(expiresAt).getTime() - Date.now()
    if (remaining <= 0 || remaining > 60 * 60 * 1000) {
      setVisible(false)
      return
    }
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey) === "1") {
      return
    }
    setVisible(true)
    const hide = window.setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(storageKey, "1")
    }, 6000)
    return () => clearTimeout(hide)
  }, [expiresAt, profileId, storageKey])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed left-3 right-3 z-[85] mx-auto max-w-lg bottom-[calc(var(--ttm-dock-height,5rem)+0.75rem)] rounded-2xl border border-rose-500/35 bg-[#1a0a0c]/95 backdrop-blur-xl px-4 py-3 shadow-[0_12px_40px_-12px_rgba(244,63,94,0.45)]"
        >
          <p className="text-sm font-light text-rose-100/95 text-center leading-snug">
            {t("matchUrgencySnackbar")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
