"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/lib/i18n"
import {
  dismissDiscoverTimeLimitsBanner,
  isDiscoverTimeLimitsBannerDismissed,
} from "@/lib/discover/time-limits-banner-storage"

type DiscoverToolbarProps = {
  premium: boolean
  onBoost: () => void
  onOpenFilters: () => void
  /** Single-row actions bar under the card — filters/boost only */
  compactRow?: boolean
}

export function DiscoverToolbar({ premium, onBoost, onOpenFilters, compactRow }: DiscoverToolbarProps) {
  const { t } = useI18n()
  const [matchHintVisible, setMatchHintVisible] = useState(false)

  useEffect(() => {
    setMatchHintVisible(!isDiscoverTimeLimitsBannerDismissed())
  }, [])

  const dismissMatchHint = () => {
    dismissDiscoverTimeLimitsBanner()
    setMatchHintVisible(false)
  }

  return (
    <div className="ttm-discover-toolbar shrink-0 w-full">
      <div className="ttm-discover-toolbar__row">
        {!compactRow && matchHintVisible ? (
          <div className="ttm-discover-toolbar__hint" role="note">
            <span className="ttm-discover-toolbar__hint-text">{t("welcomeChipMatch24")}</span>
            <button
              type="button"
              onClick={dismissMatchHint}
              className="ttm-discover-toolbar__hint-dismiss touch-manipulation"
              aria-label={t("discoverTimeLimitsDismissAria")}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : !compactRow ? (
          <span className="ttm-discover-toolbar__spacer" aria-hidden />
        ) : null}

        <div className="ttm-discover-toolbar__actions">
          <button
            type="button"
            onClick={onOpenFilters}
            className="ttm-discover-toolbar__icon-btn touch-manipulation"
            aria-label={t("discoverFiltersOpen")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 4h18M7 8h10M11 12h2M13 16h-2"
              />
            </svg>
          </button>

          {premium ? (
            <span className="ttm-discover-toolbar__boost ttm-discover-toolbar__boost--active">
              <span className="ttm-discover-toolbar__boost-dot" aria-hidden />
              {t("premiumBoostActive")}
            </span>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onBoost}
              className="ttm-discover-toolbar__boost touch-manipulation"
            >
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6L12 2z" />
              </svg>
              {t("premiumBoostChip")}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
