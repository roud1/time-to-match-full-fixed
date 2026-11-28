"use client"

import "./mobile-app-home.css"
import Image from "@/client/components/ui/smart-image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

/**
 * Start screen (Luvia 2.0) — website home and native app / installed PWA alike.
 * One screen, no scrolling: brand, one idea, one action. No feature promises.
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
          src="/brand/luvia/symbol.svg"
          alt=""
          width={676}
          height={500}
          priority
          unoptimized
        />
        <h1 id="xp-mobile-title" className="xp-mobile-home__wordmark">
          <Image src="/brand/luvia/wordmark.svg" alt="Luvia" width={412} height={152} priority unoptimized />
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
            <p className="xp-mobile-home__login">
              <span>{t("regHasAccount")}</span> <Link href="/login">{t("regSignIn")}</Link>
            </p>
          </>
        )}
      </div>
    </section>
  )
}
