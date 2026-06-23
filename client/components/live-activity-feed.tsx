"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/client/lib/i18n"

const MESSAGE_KEYS = ["liveSomeoneLiked", "liveSomeoneOnline", "liveNewMatch"] as const

type LiveActivityFeedProps = {
  /** Delay before first toast (ms). */
  appearDelayMs?: number
}

export function LiveActivityFeed({ appearDelayMs = 1200 }: LiveActivityFeedProps) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    const appear = setTimeout(() => setShow(true), appearDelayMs)
    return () => clearTimeout(appear)
  }, [reduceMotion, appearDelayMs])

  useEffect(() => {
    if (!show || reduceMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGE_KEYS.length), 5200)
    return () => clearInterval(id)
  }, [show, reduceMotion])

  if (reduceMotion || !show) return null

  const key = MESSAGE_KEYS[index]

  const openActivityHub = () => {
    window.dispatchEvent(new CustomEvent("ttm-open-activity-hub"))
  }

  return (
    <motion.button
      type="button"
      aria-label={t("activityHubTitle")}
      onClick={openActivityHub}
      className="w-full touch-manipulation text-left cursor-pointer pointer-events-auto"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 8, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="cin-nav-minimal rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-white/20 opacity-50" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/18" />
          </span>
          <p className="text-xs font-light text-foreground/90 leading-snug">{t(key)}</p>
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
