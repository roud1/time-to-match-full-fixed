"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function PremiumLandingNav() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    sync()
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      className="ttm-premium-nav"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
    >
      <nav
        className={cn("ttm-premium-nav__inner", scrolled && "ttm-premium-nav__inner--scrolled")}
        aria-label="Main"
      >
        <Link href="/" className="ttm-premium-nav__brand">
          <Logo variant="full" size="sm" className="hidden sm:inline-flex" />
          <Logo variant="icon" size="sm" className="sm:hidden" />
        </Link>
        <div className="ttm-premium-nav__links">
          <a href="#pulse" className="ttm-premium-nav__link">
            Pulse
          </a>
          <a href="#how" className="ttm-premium-nav__link">
            How
          </a>
          <a href="#cards" className="ttm-premium-nav__link">
            Profiles
          </a>
        </div>
        <div className="ttm-premium-nav__actions">
          {loggedIn ? (
            <Link href="/app" className="ttm-premium-nav__sign">
              Open app
            </Link>
          ) : (
            <>
              <Link href="/login" className="ttm-premium-nav__sign">
                Log in
              </Link>
              <Link href="/register" className="ttm-premium-cta ttm-premium-cta--sm">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
