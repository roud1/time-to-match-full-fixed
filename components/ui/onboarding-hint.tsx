"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import {
  dismissOnboardingHint,
  isOnboardingHintDismissed,
  type OnboardingHintId,
} from "@/lib/onboarding-hints"
import { cn } from "@/lib/utils"

export type OnboardingHintProps = {
  hintId: OnboardingHintId
  message: string
  className?: string
}

export function OnboardingHint({ hintId, message, className }: OnboardingHintProps) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!isOnboardingHintDismissed(hintId))
  }, [hintId])

  if (!visible) return null

  const dismiss = () => {
    dismissOnboardingHint(hintId)
    setVisible(false)
  }

  return (
    <motion.div
      role="note"
      className={cn(
        "ttm-onboarding-hint relative px-3 py-2.5 pr-9 text-left",
        className
      )}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <p className="text-[11px] sm:text-xs font-light leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg ttm-icon-muted hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft-bg)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(124,58,237,0.35)]"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </motion.div>
  )
}
