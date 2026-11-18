"use client"

import "./mobile-app-home.css"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, Lock, MapPin, ShieldCheck } from "lucide-react"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

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
        <Image
          className="xp-mobile-home__mark"
          src="/brand/luvia/v2/mark.svg"
          alt=""
          width={204}
          height={182}
          priority
          unoptimized
        />
        <h1 id="xp-mobile-title" className="xp-mobile-home__wordmark">
          <Image src="/brand/luvia/v2/wordmark.svg" alt="Luvia" width={393} height={146} priority unoptimized />
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
