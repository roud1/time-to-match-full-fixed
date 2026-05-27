"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  dismissDiscoverTimeLimitsBanner,
  isDiscoverTimeLimitsBannerDismissed,
} from "@/lib/discover/time-limits-banner-storage"
import { cn } from "@/lib/utils"

export function DiscoverTimeLimitsBanner({ className }: { className?: string }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!isDiscoverTimeLimitsBannerDismissed())
  }, [])

  const dismiss = () => {
    dismissDiscoverTimeLimitsBanner()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <motion.div
      role="note"
      className={cn("ttm-discover-limits-banner", className)}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="ttm-discover-limits-banner__icon" aria-hidden>
        ✨
      </span>
      <p className="ttm-discover-limits-banner__text flex-1 min-w-0">{t("discoverTimeLimitsBanner")}</p>
      <button
        type="button"
        onClick={dismiss}
        className="ttm-discover-limits-banner__close shrink-0 touch-manipulation"
        aria-label={t("discoverTimeLimitsDismissAria")}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}
