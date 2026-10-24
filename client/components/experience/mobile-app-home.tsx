"use client"

import "./mobile-app-home.css"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GlowButton } from "@/client/components/experience/primitives/glow-button"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { Logo } from "@/client/components/logo"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"

const STATS = ["ttmXpHeroStat1", "ttmXpHeroStat2", "ttmXpHeroStat3"] as const
const DAY = 24 * 60 * 60

const pad = (n: number) => String(n).padStart(2, "0")

/** Decorative 24h countdown (starts at 24:00:00 so server and client markup match). */
function useCountdown() {
  const [left, setLeft] = useState(DAY)
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s <= 1 ? DAY : s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [])
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`
}

/**
 * Single-screen, app-style home for phones (shown below 768px, see mobile-app-home.css).
 * No scrolling: brand, one idea, one primary action, a quiet login link.
 */
export function MobileAppHome() {
  const { t } = useI18n()
  const time = useCountdown()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const logged = isLoggedIn()
    setLoggedIn(logged)
    // Inside the app a signed-in user goes straight to the feed (like a native app would).
    if (logged && document.documentElement.hasAttribute("data-ttm-app")) {
      router.replace("/app")
    }
  }, [router])

  return (
    <section className="xp-mobile-home" aria-labelledby="xp-mobile-title">
      <div className="xp-mobile-home__top">
        <Logo variant="icon" size="sm" theme="dark" />
        <LanguageSwitcher embedded />
      </div>

      <div className="xp-mobile-home__center">
        <div className="xp-mobile-home__orb" aria-hidden>
          <span className="xp-mobile-home__ring" />
          <span className="xp-mobile-home__ring xp-mobile-home__ring--2" />
          <Image
            src="/icon.svg"
            alt=""
            width={112}
            height={112}
            priority
            unoptimized
            className="xp-mobile-home__icon"
          />
        </div>

        <p className="xp-mobile-home__timer" aria-hidden>
          {time}
        </p>

        <h1 id="xp-mobile-title" className="xp-mobile-home__title">
          <span className="xp-mobile-home__title-grad">{t("ttmXpHeroHeadline1")}</span>
          <span>{t("ttmXpHeroHeadline2")}</span>
          <span className="xp-mobile-home__title-rose">{t("ttmXpHeroHeadline3")}</span>
        </h1>

        <p className="xp-mobile-home__sub">{t("ttmXpHeroSubtitle")}</p>

        <ul className="xp-mobile-home__chips" aria-label={t("ttmXpHeroStatsLabel")}>
          {STATS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>

      <div className="xp-mobile-home__bottom">
        {loggedIn ? (
          <GlowButton href="/app" className="w-full">
            {t("navApp")}
          </GlowButton>
        ) : (
          <>
            <GlowButton href="/register" className="w-full">
              {t("ttmXpHeroCtaStart")}
            </GlowButton>
            <Link href="/login" className="xp-mobile-home__login">
              {t("ttmXpNavLogin")}
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
