"use client"

import { motion, useReducedMotion } from "motion/react"
import { Heart, Sparkles, Zap } from "lucide-react"
import { cn } from "@/client/lib/utils"
import { useI18n } from "@/client/lib/i18n"

type DatingOnboardingVisualProps = {
  variant: "timer" | "rules" | "start"
  className?: string
}

export function DatingOnboardingVisual({ variant, className }: DatingOnboardingVisualProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()

  return (
    <div className={cn("ttm-dating-onboarding__visual mb-8", className)} aria-hidden>
      {!reduce && (
        <>
          <span className="ttm-dating-onboarding__ring" />
          <span className="ttm-dating-onboarding__ring ttm-dating-onboarding__ring--inner" />
        </>
      )}

      {variant === "timer" && (
        <motion.div
          className="ttm-dating-onboarding__clock"
          initial={reduce ? false : { scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="ttm-dating-onboarding__clock-value">24:00:00</span>
          <span className="ttm-dating-onboarding__clock-label">{t("datingOnboardTimerLabel")}</span>
        </motion.div>
      )}

      {variant === "rules" && (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,46,99,0.35)] bg-[rgba(255,46,99,0.12)] text-[#ff2e63]">
              <Heart size={20} />
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/80">
              <Zap size={20} />
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/80">
              <Sparkles size={20} />
            </span>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">{t("datingOnboardRulesEyebrow")}</span>
        </motion.div>
      )}

      {variant === "start" && (
        <motion.div
          className="ttm-dating-onboarding__clock"
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          <Sparkles className="text-[#ff2e63]" size={28} />
          <span className="ttm-dating-onboarding__clock-label mt-1">{t("datingOnboardStartLabel")}</span>
        </motion.div>
      )}
    </div>
  )
}
