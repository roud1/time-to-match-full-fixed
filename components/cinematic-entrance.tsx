"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Logo } from "@/components/logo"

const STORAGE_KEY = "ttm-cinematic-seen"

export function CinematicEntrance() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }
    setVisible(true)
    const done = setTimeout(() => dismiss(), 1600)
    return () => clearTimeout(done)
  }, [reduceMotion])

  const dismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030306]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onClick={dismiss}
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 site-bg-noise opacity-[0.08]"
            aria-hidden
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,600px)] h-[400px] rounded-full opacity-70"
            style={{
              background:
                "radial-gradient(ellipse, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.2) 40%, transparent 70%)",
              filter: "blur(80px)",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="relative z-10 text-center px-6"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="drop-shadow-[0_0_24px_rgba(236,72,153,0.5)]">
                <Logo size="lg" />
              </span>
            </motion.div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-pink-300/80 font-light mb-3">
              {t("entranceTagline")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/95">
              {t("entranceHeadline")}
            </h2>
          </motion.div>

          <motion.p
            className="absolute bottom-10 text-[10px] text-white/30 font-light tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {t("entranceTap")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
