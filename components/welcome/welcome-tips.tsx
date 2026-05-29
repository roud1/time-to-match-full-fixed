"use client"

import { useI18n } from "@/lib/i18n"

export function WelcomeTips() {
  const { t } = useI18n()

  return (
    <ul className="ttm-welcome-page__tips">
      {[t("welcomeTip1"), t("welcomeTip2"), t("welcomeTip3")].map((tip) => (
        <li key={tip} className="ttm-welcome-page__tip">
          <span className="ttm-welcome-page__tip-mark" aria-hidden>
            ◆
          </span>
          {tip}
        </li>
      ))}
    </ul>
  )
}
