"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useI18n } from "@/lib/i18n"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function DatingLandingNav() {
  const { t } = useI18n()
  const [loggedIn, setLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("ttm-user-profile-changed", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("ttm-user-profile-changed", sync)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      className="ttm-dating-nav"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className={cn("ttm-dating-nav__inner", scrolled && "ttm-dating-nav__inner--scrolled")}
        aria-label="Main"
      >
        <Link href="/" className="ttm-dating-nav__brand">
          <Logo />
          <span>Time to Match</span>
        </Link>
        <div className="ttm-dating-nav__links">
          <a href="#ai" className="ttm-dating-nav__link">
            {t("datingNavAi")}
          </a>
          <a href="#how" className="ttm-dating-nav__link">
            {t("datingNavHow")}
          </a>
        </div>
        <div className="ttm-dating-nav__actions">
          <ThemeToggle compact className="ttm-dating-nav__theme" />
          {loggedIn ? (
            <Link href="/app" className="ttm-dating-nav__sign">
              {t("navApp")}
            </Link>
          ) : (
            <>
              <Link href="/login" className="ttm-dating-nav__sign">
                {t("login")}
              </Link>
              <Link href="/register" className="ttm-dating-cta ttm-dating-cta--sm">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
