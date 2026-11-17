"use client"

import "./mobile-app-home.css"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { ArrowRight, Lock, MapPin, ShieldCheck } from "lucide-react"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

function HourglassMark() {
  const id = useId()
  return (
    <svg className="xp-mobile-home__mark" viewBox="0 0 64 88" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-hg`} x1="8" y1="4" x2="56" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c4a1ff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id}-hg)`} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6h46M9 82h46" />
        <path d="M14 6c0 24 13 30 18 38-5 8-18 14-18 38" />
        <path d="M50 6c0 24-13 30-18 38 5 8 18 14 18 38" />
        <path d="M25 24c4 3.5 10 3.5 14 0" />
        <path d="M21 77c6-9 16-9 22 0" />
      </g>
    </svg>
  )
}

const TRUST = [
  { Icon: ShieldCheck, key: "appHomeTrustSafe" },
  { Icon: Lock, key: "appHomeTrustModeration" },
  { Icon: MapPin, key: "appHomeTrustLocation" },
] as const

/**
 * Start screen of the native app / installed PWA (shown only via html[data-ttm-app], see mobile-app-home.css).
 * One screen, no scrolling: brand, one idea, one action.
 */
export function MobileAppHome() {
  const { t } = useI18n()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const logged = isLoggedIn()
    setLoggedIn(logged)
    // Inside the app a signed-in user goes straight to the feed.
    if (logged && document.documentElement.hasAttribute("data-ttm-app")) {
      router.replace("/app")
    }
  }, [router])

  return (
    <section className="xp-mobile-home" aria-labelledby="xp-mobile-title">
      <div className="xp-mobile-home__top">
        <LanguageSwitcher embedded />
      </div>

      <div className="xp-mobile-home__brand">
        <HourglassMark />
        <h1 id="xp-mobile-title" className="xp-mobile-home__wordmark">
          <span className="xp-mobile-home__wordmark-top">TIME TO</span>
          <span className="xp-mobile-home__wordmark-main">MATCH</span>
        </h1>
        <p className="xp-mobile-home__tagline">{t("appHomeTagline")}</p>
      </div>

      <div className="xp-mobile-home__bottom">
        {loggedIn ? (
          <Link href="/app" className="xp-mobile-home__cta">
            <span>{t("navApp")}</span>
            <ArrowRight aria-hidden className="h-5 w-5" />
          </Link>
        ) : (
          <>
            <Link href="/register" className="xp-mobile-home__cta">
              <span>{t("appHomeStart")}</span>
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
            <Link href="/login" className="xp-mobile-home__login">
              {t("ttmXpNavLogin")}
            </Link>
          </>
        )}
        <ul className="xp-mobile-home__trust">
          {TRUST.map(({ Icon, key }) => (
            <li key={key}>
              <Icon aria-hidden className="h-6 w-6" strokeWidth={1.5} />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
