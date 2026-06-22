"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import { isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

export function AiLandingNav() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn())
    sync()
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      className="ttm-ai-nav"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
    >
      <nav
        className={cn("ttm-ai-nav__inner", scrolled && "ttm-ai-nav__inner--scrolled")}
        aria-label="Main"
      >
        <Link href="/" className="ttm-ai-nav__brand">
          <Logo variant="full" size="sm" className="hidden sm:inline-flex" />
          <Logo variant="icon" size="sm" className="sm:hidden" />
        </Link>
        <div className="ttm-ai-nav__links">
          <a href="#ai" className="ttm-ai-nav__link">
            AI
          </a>
          <a href="#demo" className="ttm-ai-nav__link">
            Demo
          </a>
          <a href="#score" className="ttm-ai-nav__link">
            Score
          </a>
        </div>
        <div className="ttm-ai-nav__actions">
          {loggedIn ? (
            <Link href="/app" className="ttm-ai-cta ttm-ai-cta--sm">
              Open app
            </Link>
          ) : (
            <>
              <Link href="/login" className="ttm-ai-nav__sign">
                Log in
              </Link>
              <Link href="/register" className="ttm-ai-cta ttm-ai-cta--sm">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
