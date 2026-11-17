"use client"

import "./app-profile-home.css"
import Link from "next/link"
import Image from "next/image"
import {
  Bell,
  ChevronRight,
  Crown,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  PencilLine,
  UserRound,
} from "lucide-react"
import { useI18n } from "@/client/lib/i18n"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { VerifiedBadge } from "@/client/components/ui/verified-badge"

type AppProfileHomeProps = {
  name: string
  age: number | null
  photo: string | null
  verified: boolean
  premium: boolean
  /** ISO time the profile leaves the feed (null = no expiry known). */
  expiresAt: string | null | undefined
  onEdit: () => void
  onLogout: () => void
}

/**
 * Profile & settings ("Профиль") of the native app / installed PWA — rendered only when html[data-ttm-app] is set.
 * Every row opens an existing, working screen; nothing here is decorative.
 */
export function AppProfileHome({ name, age, photo, verified, premium, expiresAt, onEdit, onLogout }: AppProfileHomeProps) {
  const { t } = useI18n()
  const hidden = Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now())

  const rows: Array<{ key: string; icon: typeof Bell; label: string; href?: string; onClick?: () => void; external?: boolean }> = [
    { key: "edit", icon: PencilLine, label: t("appMeEdit"), onClick: onEdit },
    { key: "privacy", icon: Lock, label: t("appMePrivacy"), href: "/settings?section=privacy" },
    { key: "notifications", icon: Bell, label: t("settingsNotifications"), href: "/settings?section=notifications" },
  ]
  const rows2: typeof rows = [
    { key: "support", icon: HelpCircle, label: t("appMeSupport"), href: "mailto:support@timetomatch.app", external: true },
    { key: "about", icon: Info, label: t("appMeAbout"), href: "/about" },
  ]

  const renderRow = (r: (typeof rows)[number]) => {
    const inner = (
      <>
        <r.icon aria-hidden className="ttm-app-me__row-icon" strokeWidth={1.7} />
        <span className="ttm-app-me__row-label">{r.label}</span>
        <ChevronRight aria-hidden className="ttm-app-me__row-chevron" strokeWidth={1.8} />
      </>
    )
    if (r.onClick)
      return (
        <li key={r.key}>
          <button type="button" className="ttm-app-me__row" onClick={r.onClick}>
            {inner}
          </button>
        </li>
      )
    return (
      <li key={r.key}>
        {r.external ? (
          <a className="ttm-app-me__row" href={r.href}>
            {inner}
          </a>
        ) : (
          <Link className="ttm-app-me__row" href={r.href!}>
            {inner}
          </Link>
        )}
      </li>
    )
  }

  return (
    <div className="ttm-app-me">
      <button type="button" className="ttm-app-me__identity" onClick={onEdit}>
        <span className="ttm-app-me__avatar">
          {photo ? (
            <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <UserRound aria-hidden strokeWidth={1.5} />
          )}
        </span>
        <span className="ttm-app-me__who">
          <span className="ttm-app-me__name">
            <span className="truncate">
              {name}
              {age ? `, ${age}` : ""}
            </span>
            {verified && <VerifiedBadge size={18} title={t("photoVerifiedLabel")} />}
          </span>
          <span className={hidden ? "ttm-app-me__status is-hidden" : "ttm-app-me__status"}>
            {hidden ? t("appMeHidden") : t("appMeActive")}
          </span>
        </span>
        <ChevronRight aria-hidden className="ttm-app-me__row-chevron" strokeWidth={1.8} />
      </button>

      <Link href="/profile?tab=premium" className="ttm-app-me__premium">
        <span className="ttm-app-me__crown" aria-hidden>
          <Crown strokeWidth={1.8} />
        </span>
        <span className="ttm-app-me__premium-text">
          <span className="ttm-app-me__premium-title">Premium</span>
          <span className="ttm-app-me__premium-body">{premium ? t("appMePremiumActive") : t("appMePremiumBody")}</span>
        </span>
        <ChevronRight aria-hidden className="ttm-app-me__row-chevron" strokeWidth={1.8} />
      </Link>

      <ul className="ttm-app-me__list">
        {rows.map(renderRow)}
        <li>
          <div className="ttm-app-me__row ttm-app-me__row--lang">
            <Globe aria-hidden className="ttm-app-me__row-icon" strokeWidth={1.7} />
            <span className="ttm-app-me__row-label">{t("appMeLanguage")}</span>
            <LanguageSwitcher embedded />
          </div>
        </li>
        {rows2.map(renderRow)}
        <li>
          <button type="button" className="ttm-app-me__row ttm-app-me__row--logout" onClick={onLogout}>
            <LogOut aria-hidden className="ttm-app-me__row-icon" strokeWidth={1.7} />
            <span className="ttm-app-me__row-label">{t("profileLogout")}</span>
            <ChevronRight aria-hidden className="ttm-app-me__row-chevron" strokeWidth={1.8} />
          </button>
        </li>
      </ul>
    </div>
  )
}
