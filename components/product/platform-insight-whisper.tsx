"use client"

import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { markReflectionV2Shown } from "@/lib/emotional-consciousness"
import { markRealityNarrativeShown } from "@/lib/reality-expansion"
import type { PlatformInsight } from "@/lib/product-platform-insight"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type PlatformInsightWhisperProps = {
  insight: PlatformInsight | null
  className?: string
}

export function PlatformInsightWhisper({ insight, className }: PlatformInsightWhisperProps) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)

  if (!insight || !open) return null

  const text =
    insight.kind === "reflection"
      ? t(insight.reflection.textKey)
      : insight.kind === "narrative"
        ? t(insight.narrative.textKey)
        : insight.kind === "energy"
          ? t(insight.messageKey)
          : t(insight.textKey)

  const dismiss = () => {
    if (insight.kind === "reflection") {
      markReflectionV2Shown(insight.reflection.scope)
    } else if (insight.kind === "narrative") {
      markRealityNarrativeShown(insight.narrative.scope)
    }
    setOpen(false)
  }

  const dismissLabel =
    insight.kind === "reflection"
      ? t("ecReflectDismiss")
      : insight.kind === "narrative"
        ? t("erNarrativeDismiss")
        : undefined

  return (
    <AnimatePresence>
      <motion.p
        key={
          insight.kind === "reflection"
            ? insight.reflection.id
            : insight.kind === "narrative"
              ? insight.narrative.id
              : insight.kind
        }
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={cn("p22-platform-insight", className)}
        role="status"
      >
        <span className="p22-platform-insight__dot" aria-hidden />
        {text}
        {dismissLabel && (
          <button
            type="button"
            className="p22-platform-insight__dismiss"
            onClick={dismiss}
            aria-label={dismissLabel}
          >
            ·
          </button>
        )}
      </motion.p>
    </AnimatePresence>
  )
}
