"use client"

import "@/app/dating-landing.css"
import "@/app/auth-login.css"

import type { ReactNode } from "react"
import { LoginCardScene } from "@/components/auth/login-card-scene"
import { LoginLiveStatus } from "@/components/auth/login-live-status"
import { LoginTrustRow } from "@/components/auth/login-trust-row"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type AuthMarketingLayoutProps = {
  children: ReactNode
  /** Wider form column for multi-step register */
  wide?: boolean
}

/** Shared login/register layout: pitch, live status, trust, profile cards. */
export function AuthMarketingLayout({ children, wide }: AuthMarketingLayoutProps) {
  const { t } = useI18n()
  const chips = [t("datingHeroChip1"), t("datingHeroChip2")]

  const pitch = (
    <>
      <p className="ttm-login-page__eyebrow">{t("datingHeroEyebrow")}</p>
      <h2 className="ttm-login-page__title">
        <span>{t("datingHeroTitleLine1")}</span>
        <span className="ttm-login-page__title-soft">{t("datingHeroTitleLine2")}</span>
      </h2>
      <ul className="ttm-login-page__chips" aria-label={t("datingHeroChipsAria")}>
        {chips.map((chip) => (
          <li key={chip} className="ttm-login-page__chip">
            {chip}
          </li>
        ))}
      </ul>
    </>
  )

  return (
    <div className={cn("ttm-login-page", wide && "ttm-login-page--wide")}>
      <div className="ttm-login-page__pitch ttm-login-page__pitch--mobile">{pitch}</div>

      <div className="ttm-login-page__grid">
        <div className="ttm-login-page__form-col">
          <LoginLiveStatus />
          {children}
          <LoginTrustRow />
          <div className="ttm-login-page__scene-mobile">
            <LoginCardScene variant="compact" />
          </div>
        </div>

        <div className="ttm-login-page__visual-col">
          <div className="ttm-login-page__pitch ttm-login-page__pitch--desktop">{pitch}</div>
          <LoginCardScene variant="full" />
        </div>
      </div>
    </div>
  )
}
