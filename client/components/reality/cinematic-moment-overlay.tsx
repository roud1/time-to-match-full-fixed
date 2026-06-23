"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { CinematicMomentState } from "@/client/lib/reality"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

type CinematicMomentOverlayProps = {
  cinematic: CinematicMomentState | null
  className?: string
}

export function CinematicMomentOverlay({ cinematic, className }: CinematicMomentOverlayProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {cinematic?.active && (
        <motion.div
          key={cinematic.kind}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className={cn("p16-cinematic-burst", className)}
          style={{
            ["--real-burst" as string]: String(cinematic.burst),
            ["--real-cine-motion" as string]: String(cinematic.motionScale),
          }}
          role="status"
          aria-live="polite"
        >
          <div className="p16-cinematic-burst__flash" aria-hidden />
          <div className="p16-cinematic-burst__ring" aria-hidden />
          <p className="p16-cinematic-burst__title">{t(cinematic.titleKey)}</p>
          <p className="p16-cinematic-burst__body">{t(cinematic.bodyKey)}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
