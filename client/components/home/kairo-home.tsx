"use client"

import Image from "@/client/components/ui/smart-image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, ShieldCheck, Timer, Users, Zap } from "lucide-react"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { useI18n } from "@/client/lib/i18n"
import { isLoggedIn } from "@/client/lib/user-profile"
import styles from "./kairo-home.module.css"

/**
 * Public start page (Kairo) — website, installed PWA and the native app alike.
 * Layout follows the home reference: brand, headline, hero picture with the 24-hour timer
 * as an illustration of the match mechanic (static, nothing counts down here), three facts, CTA.
 */
export function KairoHome() {
  const { t } = useI18n()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const logged = isLoggedIn()
    setLoggedIn(logged)
    // Inside the app a signed-in user goes straight to the feed (unchanged behaviour).
    if (logged && document.documentElement.hasAttribute("data-ttm-app")) {
      router.replace("/app")
    }
  }, [router])

  const features = [
    { Icon: Zap, label: t("lvHomeFeatFast") },
    { Icon: Users, label: t("lvHomeFeatMatch") },
    { Icon: ShieldCheck, label: t("lvHomeFeatSafe") },
  ]

  return (
    <main className={styles.page} aria-labelledby="lv-home-title">
      <div className={styles.lang}>
        <LanguageSwitcher embedded />
      </div>

      <header className={styles.brand}>
        <Image
          src="/kairo/kairo-logo.webp"
          alt="Kairo"
          width={660}
          height={268}
          priority
          sizes="(max-width: 380px) 200px, 240px"
          className={styles.logo}
        />
      </header>

      <section className={styles.intro}>
        <h1 id="lv-home-title">
          {t("lvHomeHeadline")} <em>{t("lvHomeHeadlineAccent")}</em>
        </h1>
        <p>{t("lvHomeSubtitle")}</p>
      </section>

      <div className={styles.hero}>
        <Image
          src="/kairo/hero.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 520px) 100vw, 520px"
          className={styles.heroImage}
        />
        <div className={styles.timer} role="img" aria-label={`24:00:00 — ${t("lvHomeTimerLabel")}`}>
          <strong>
            <Timer aria-hidden strokeWidth={1.5} />
            24:00:00
          </strong>
          <span>{t("lvHomeTimerLabel")}</span>
        </div>
      </div>

      <ul className={styles.features}>
        {features.map(({ Icon, label }) => (
          <li key={label}>
            <Icon aria-hidden strokeWidth={1.3} />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <footer className={styles.actions}>
        {loggedIn ? (
          <Link className={styles.cta} href="/app">
            {t("navApp")} <ArrowRight aria-hidden strokeWidth={1.8} />
          </Link>
        ) : (
          <>
            <Link className={styles.cta} href="/register">
              {t("lvHomeCta")} <ArrowRight aria-hidden strokeWidth={1.8} />
            </Link>
            <p>
              {t("regHasAccount")} <Link href="/login">{t("regSignIn")}</Link>
            </p>
          </>
        )}
      </footer>
    </main>
  )
}
