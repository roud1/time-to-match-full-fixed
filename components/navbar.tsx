"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Logo } from "@/components/logo"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#how", labelKey: "howItWorks" },
  { href: "/#profiles", labelKey: "profilesBadge" },
] as const

export function Navbar() {
  const { t } = useI18n()
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
          "mx-auto max-w-6xl flex items-center justify-between rounded-2xl px-3 py-2.5 md:px-6 md:py-3 transition-all duration-500",
          scrolled
            ? "premium-nav-scrolled border border-foreground/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
            : "glass border border-foreground/5"
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

        <div className="flex items-center gap-2 md:gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/app"
                className="hidden md:inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white text-sm font-light hover:opacity-90 transition-opacity"
              >
                {t("navApp")}
              </Link>
              <Link
                href="/profile"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/90 text-sm font-light hover:bg-foreground/10 transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs text-white">
                  {(userName ?? "?").charAt(0).toUpperCase()}
                </span>
                {t("navProfile")}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex px-4 py-2 text-sm font-extralight text-muted-foreground nav-link-underline hover:text-foreground"
            >
              {t("login")}
            </Link>
          )}
          {!loggedIn && (
            <Link
              href="/register"
              className="px-3 md:px-5 py-2.5 min-h-[44px] inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-light hover:opacity-90 transition-opacity shadow-md shadow-pink-500/20"
            >
              {t("register")}
            </Link>
          )}
          {loggedIn && (
            <Link
              href="/profile"
              className="md:hidden w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm text-white font-light"
              aria-label={t("navProfile")}
            >
              {(userName ?? "?").charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
