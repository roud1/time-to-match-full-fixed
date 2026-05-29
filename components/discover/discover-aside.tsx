"use client"

import { useI18n } from "@/lib/i18n"
import { WelcomeMatchTimer } from "@/components/welcome/welcome-match-timer"
import { WelcomeTips } from "@/components/welcome/welcome-tips"
import { cn } from "@/lib/utils"

type DiscoverAsideProps = {
  className?: string
  /** Mobile footer: gestures only */
  compact?: boolean
}

export function DiscoverAside({ className, compact }: DiscoverAsideProps) {
  const { t } = useI18n()

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {!compact && <WelcomeMatchTimer />}

      <div className="ttm-welcome-page__panel" aria-label={t("discoverAsideGesturesAria")}>
        <p className="ttm-welcome-page__panel-title">{t("discoverAsideGesturesTitle")}</p>
        <div className="ttm-welcome-page__gesture-grid">
          <div className="ttm-welcome-page__gesture ttm-welcome-page__gesture--pass">
            <span className="ttm-welcome-page__gesture-key" aria-hidden>
              ←
            </span>
            <span className="ttm-welcome-page__gesture-text">{t("discoverPassLabel")}</span>
          </div>
          <div className="ttm-welcome-page__gesture ttm-welcome-page__gesture--like">
            <span className="ttm-welcome-page__gesture-key" aria-hidden>
              →
            </span>
            <span className="ttm-welcome-page__gesture-text">{t("discoverConnectLabel")}</span>
          </div>
        </div>
      </div>

      {!compact && <WelcomeTips />}
    </div>
  )
}
