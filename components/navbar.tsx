"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Logo } from "@/components/logo"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#how", labelKey: "howItWorks" },
  { href: "/profile?tab=premium", labelKey: "navPremium" },
] as const

export function Navbar() {
  const { t } = useI18n()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isLoggedIn())
      setUserName(getUserProfile()?.name ?? null)
    }
    sync()
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-3 py-3 md:px-6 md:py-4 transition-all duration-500",
        scrolled && "py-2 md:py-3"
      )}
    >
      <nav
        className={cn(
          "mx-auto max-w-6xl flex items-center justify-between ttm-surface-nav px-3 py-2.5 md:px-6 md:py-3",
          scrolled ? "ttm-surface-nav--solid nav-glow-ring" : "ttm-surface-nav--glass"
        )}
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
        >
          <span className="transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.5)]">
            <Logo />
          </span>
          <span className="text-foreground/90 font-light tracking-wide text-sm hidden sm:inline">
            Time to Match
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link-underline px-4 py-2 text-sm font-extralight text-muted-foreground hover:text-foreground transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {loggedIn ? (
            <>
              <Link href="/app" className="ttm-nav-pill-primary hidden md:inline-flex">
                {t("navApp")}
              </Link>
              <Link href="/profile" className="ttm-nav-pill-secondary">
                <span className="ttm-nav-avatar">{(userName ?? "?").charAt(0).toUpperCase()}</span>
                {t("navProfile")}
              </Link>
            </>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2",
                isHome &&
                  "rounded-full bg-black/35 p-1 ring-1 ring-pink-500/25 shadow-lg shadow-black/40 backdrop-blur-md"
              )}
            >
              <Link
                href="/login"
                className={cn(
                  "relative inline-flex items-center justify-center min-h-[44px] rounded-full px-3 sm:px-4 text-xs sm:text-sm font-light tracking-wide text-white no-underline",
                  "bg-gradient-to-br from-[#2d243c] via-[#453059] to-[#1a1524]",
                  "border border-white/25 shadow-md shadow-black/50",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                  "hover:scale-[1.06] hover:border-pink-400/55 hover:shadow-[0_0_28px_-2px_rgba(236,72,153,0.55),0_8px_28px_-10px_rgba(0,0,0,0.45)] hover:brightness-110",
                  "active:scale-[0.96]",
                  isHome && "ring-1 ring-pink-400/30"
                )}
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className={cn(
                  "relative inline-flex min-h-[44px] items-center justify-center overflow-hidden rounded-full px-3 sm:px-5 text-xs sm:text-sm font-light tracking-wide text-white no-underline",
                  "bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-700",
                  "border border-white/25 shadow-lg shadow-pink-500/45",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
                  "hover:scale-[1.06] hover:shadow-[0_0_40px_-4px_rgba(236,72,153,0.65),0_0_48px_-8px_rgba(168,85,247,0.45)] hover:brightness-110",
                  "active:scale-[0.96]",
                  "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-r after:from-transparent after:via-white/35 after:to-transparent after:opacity-0 after:transition-opacity after:duration-500 hover:after:opacity-100 after:content-['']",
                  isHome && "ring-1 ring-fuchsia-400/35"
                )}
              >
                <span className="relative z-10">{t("register")}</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
