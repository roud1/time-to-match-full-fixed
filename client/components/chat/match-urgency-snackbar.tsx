"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/client/lib/i18n"

const URGENT_MS = 60 * 60 * 1000
const SHOW_MS = 6000

type MatchUrgencySnackbarProps = {
  expiresAt: string
  profileId: number
  /** fixed = viewport bottom; inline = banner inside chat column (desktop) */
  placement?: "fixed" | "inline"
  /** Bumps when match expiry is extended (bond / freeze). */
  urgencySignal?: number
}

export function MatchUrgencySnackbar({
  expiresAt,
  profileId,
  placement = "fixed",
  urgencySignal = 0,
}: MatchUrgencySnackbarProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const storageKey = `ttm-match-urgency-snack:${profileId}`
  const wasAboveUrgentRef = useRef(true)
  const prevSignalRef = useRef(urgencySignal)
  const hideTimerRef = useRef<number | undefined>(undefined)

  const isSnooze = () =>
    typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey) === "1"

  const armVisible = () => {
    if (isSnooze()) return
    window.clearTimeout(hideTimerRef.current)
    setVisible(true)
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem(storageKey, "1")
    }, SHOW_MS)
  }

  useEffect(() => {
    const remaining = new Date(expiresAt).getTime() - Date.now()
    wasAboveUrgentRef.current = remaining > URGENT_MS || remaining <= 0
  }, [expiresAt, profileId])

  useEffect(() => {
    if (isSnooze()) return

    const check = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now()
      if (remaining <= 0 || remaining > URGENT_MS) {
        if (remaining > URGENT_MS || remaining <= 0) wasAboveUrgentRef.current = true
        return
      }
      if (wasAboveUrgentRef.current) {
        wasAboveUrgentRef.current = false
        armVisible()
      }
    }

    check()
    const id = window.setInterval(check, 30_000)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(hideTimerRef.current)
    }
  }, [expiresAt, profileId, storageKey])

  useEffect(() => {
    if (urgencySignal === prevSignalRef.current || urgencySignal === 0) return
    prevSignalRef.current = urgencySignal

    const remaining = new Date(expiresAt).getTime() - Date.now()
    if (remaining <= 0 || remaining > URGENT_MS) return
    armVisible()
    return () => window.clearTimeout(hideTimerRef.current)
  }, [urgencySignal, expiresAt, profileId, storageKey])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={
            placement === "inline"
              ? "shrink-0 mx-3 mt-2 rounded-xl border border-rose-500/35 bg-[#1a0a0c]/95 backdrop-blur-xl px-3 py-2 shadow-[0_8px_24px_-12px_rgba(244,63,94,0.4)]"
              : "fixed left-3 right-3 z-[85] mx-auto max-w-lg bottom-[calc(var(--ttm-dock-height,5rem)+0.75rem)] rounded-2xl border border-rose-500/35 bg-[#1a0a0c]/95 backdrop-blur-xl px-4 py-3 shadow-[0_12px_40px_-12px_rgba(244,63,94,0.45)]"
          }
        >
          <p className="text-sm font-light text-rose-100/95 text-center leading-snug">
            {t("matchUrgencySnackbar")}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
