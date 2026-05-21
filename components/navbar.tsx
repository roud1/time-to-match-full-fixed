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
  { href: "/#evolution", labelKey: "landingNavEvolution" },
  { href: "/#how", labelKey: "howItWorks" },
] as const

type NavbarProps = {
  variant?: "default" | "landing"
}

export function Navbar({ variant = "default" }: NavbarProps) {
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
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 transition-all duration-700",
        scrolled && "py-3"
      )}
    >
      <nav
        className={cn(
          "mx-auto max-w-6xl flex items-center justify-between rounded-2xl px-4 py-3 md:px-6 md:py-3 transition-all duration-700",
          variant === "landing"
            ? scrolled
              ? "landing-nav landing-nav--scrolled ttm-brand-glass-float"
              : "landing-nav ttm-brand-glass"
            : scrolled
              ? "cin-nav-minimal cin-nav-minimal--scrolled"
              : "cin-nav-minimal"
        )}
        aria-label="Main"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/25"
        >
          <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            <Logo />
          </span>
          <span className="text-white/80 font-light tracking-[0.12em] text-xs uppercase hidden sm:inline">
            Time to Match
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "landing-nav__link px-4 py-2 text-sm text-white/40 hover:text-white/88 transition-colors duration-500",
                variant !== "landing" && "font-light"
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {loggedIn ? (
            <>
              <Link
                href="/app"
                className="hidden md:inline-flex items-center min-h-[40px] px-4 rounded-full text-sm font-light text-white/90 cin-btn-ghost transition-all duration-500"
              >
                {t("navApp")}
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 min-h-[40px] px-3 rounded-full text-sm font-light text-white/85 cin-glass hover:border-white/18 transition-all duration-500"
              >
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/90">
                  {(userName ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{t("navProfile")}</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  "ttm-brand-interactive inline-flex items-center justify-center min-h-[44px] rounded-full px-4 text-sm font-extralight text-white/70 cin-btn-ghost hover:text-white/95",
                  isHome && "border-white/14"
                )}
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className={cn(
                  "ttm-brand-cta inline-flex min-h-[44px] items-center justify-center text-sm",
                  isHome && variant === "landing" && "landing-nav__cta"
                )}
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  )
}
