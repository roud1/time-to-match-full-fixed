"use client"

import { useI18n } from "@/lib/i18n"

export function DatingLandingFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="ttm-dating-footer">
      <div className="ttm-dating-container">
        <p className="ttm-dating-footer__copy">
          © {year} {t("datingFooterRights")}
        </p>
      </div>
    </footer>
  )
}
