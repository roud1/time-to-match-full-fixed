"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"

const MESSAGE_KEYS = ["liveSomeoneLiked", "liveSomeoneOnline", "liveNewMatch"] as const

export function LiveActivityFeed() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    const appear = setTimeout(() => setShow(true), 3200)
    return () => clearTimeout(appear)
  }, [reduceMotion])

  useEffect(() => {
    if (!show || reduceMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGE_KEYS.length), 5200)
    return () => clearInterval(id)
  }, [show, reduceMotion])

  if (reduceMotion || !show) return null

  const key = MESSAGE_KEYS[index]

  return (
    <motion.div
      className="fixed z-40 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm top-[5.5rem] sm:top-auto sm:bottom-28 pointer-events-none"
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
          className="premium-nav-scrolled rounded-2xl px-4 py-3 border border-pink-500/20 shadow-lg shadow-pink-500/10 flex items-center gap-3"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="live-dot-pulse absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
          </span>
          <p className="text-xs font-light text-foreground/90 leading-snug">{t(key)}</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
