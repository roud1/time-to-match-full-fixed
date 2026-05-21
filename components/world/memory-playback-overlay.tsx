"use client"

import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import { STAGE_LABEL_KEYS, type RelationshipEcosystemStage } from "@/lib/ecosystem"
import { cn } from "@/lib/utils"

export type MemoryPlaybackItem = {
  title: string
  body: string
  dateLabel: string
  stage?: RelationshipEcosystemStage
}

type MemoryPlaybackOverlayProps = {
  item: MemoryPlaybackItem | null
  onClose: () => void
}

export function MemoryPlaybackOverlay({ item, onClose }: MemoryPlaybackOverlayProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="world-memory-playback fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="world-memory-playback__card relative w-full max-w-md px-8 py-10"
            initial={reduce ? false : { opacity: 0, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            data-eco-stage={item.stage}
          >
            <div className="world-memory-playback__glow" aria-hidden />
            <p className="world-memory-playback__eyebrow">{t("memoryPlaybackEyebrow")}</p>
            {item.stage && (
              <p className="text-[9px] uppercase tracking-[0.28em] text-indigo-200/55 font-extralight mb-3">
                {t(STAGE_LABEL_KEYS[item.stage])}
              </p>
            )}
            <h2 className="text-xl font-extralight text-white/95 leading-snug">{item.title}</h2>
            <p className="text-sm font-light text-white/50 mt-4 leading-relaxed">{item.body}</p>
            <p className="text-[10px] text-white/30 font-light mt-6 tabular-nums">{item.dateLabel}</p>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "mt-8 w-full py-3 rounded-2xl border border-white/12",
                "text-xs font-light text-white/70 hover:border-white/25 transition-colors"
              )}
            >
              {t("memoryPlaybackClose")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
