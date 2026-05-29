"use client"

import { LoginCardScene } from "@/components/auth/login-card-scene"
import { useI18n } from "@/lib/i18n"

export function WelcomeFeedPreview() {
  const { t } = useI18n()

  return (
    <div className="ttm-welcome-feed-preview">
      <p className="ttm-welcome-feed-preview__title">{t("welcomeFeedPreviewTitle")}</p>
      <p className="ttm-welcome-feed-preview__body">{t("welcomeFeedPreviewBody")}</p>
      <LoginCardScene variant="compact" />
    </div>
  )
}
