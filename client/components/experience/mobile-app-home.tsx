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

/** Horizon of a planet with a couple standing on it (decorative). */
function HorizonScene() {
  const id = useId()
  return (
    <svg
      className="xp-mobile-home__scene-svg"
      viewBox="0 0 375 520"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-halo`} cx="187.5" cy="210" r="215" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a855f7" stopOpacity=".55" />
          <stop offset=".5" stopColor="#6d28d9" stopOpacity=".2" />
          <stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="375" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7c3aed" stopOpacity=".15" />
          <stop offset=".5" stopColor="#d8b4fe" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity=".15" />
        </linearGradient>
        <radialGradient id={`${id}-body`} cx="187" cy="230" r="380" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1b0b36" />
          <stop offset=".55" stopColor="#0a0414" />
          <stop offset="1" stopColor="#050209" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="375" height="520" fill={`url(#${id}-halo)`} />
      <circle cx="187.5" cy="700" r="500" stroke={`url(#${id}-rim)`} strokeWidth="6" filter={`url(#${id}-blur)`} />
      <circle cx="187.5" cy="700" r="500" fill={`url(#${id}-body)`} stroke={`url(#${id}-rim)`} strokeWidth="1.6" />
      <g fill="#05020a" stroke="#c4a1ff" strokeOpacity=".35" strokeWidth=".5" transform="translate(190 164) scale(1.5) translate(-190 -164)">
        <circle cx="178" cy="172" r="4.6" />
        <path d="M172.6 180.5c0-2.4 2.4-3.6 5.4-3.6s5.4 1.2 5.4 3.6V200l-1.2 22h-2.6l-1.6-18-1.6 18h-2.6l-1.2-22z" />
        <circle cx="198" cy="176" r="4.2" />
        <path d="M193 184c0-2.2 2.2-3.3 5-3.3s5 1.1 5 3.3v15l-1 23h-2.4l-1.6-17-1.6 17H194l-1-23z" />
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
      <div className="xp-mobile-home__scene" aria-hidden>
        <HorizonScene />
      </div>

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
