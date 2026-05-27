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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/97 backdrop-blur-sm"
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
                "radial-gradient(ellipse, rgba(45,212,191,0.12) 0%, rgba(167,139,250,0.08) 40%, transparent 70%)",
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
              <span className="drop-shadow-[0_0_20px_rgba(45,212,191,0.35)]">
                <Logo size="lg" />
              </span>
            </motion.div>
            <p className="ttm-cin-overline mb-3 text-muted-foreground">
              {t("entranceTagline")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              {t("entranceHeadline")}
            </h2>
          </motion.div>

          <motion.p
            className="absolute bottom-10 text-[10px] text-muted-foreground font-medium tracking-widest uppercase"
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
