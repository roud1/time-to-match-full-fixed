"use client"

import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Logo } from "@/components/logo"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme/theme-toggle"

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
  const [mobileOpen, setMobileOpen] = useState(false)

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

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-4 sm:py-4 md:px-8 transition-all duration-700",
        scrolled && "py-2 sm:py-3"
      )}
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
    >
      <nav
        className={cn(
          "mx-auto max-w-6xl flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-3 transition-all duration-700",
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
          className="group flex items-center gap-2 sm:gap-3 rounded-lg min-w-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(124,58,237,0.35)]"
        >
          <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] shrink-0">
            <Logo />
          </span>
          <span className="text-[var(--text-primary)]/80 font-light tracking-[0.12em] text-xs uppercase hidden sm:inline truncate">
            Time to Match
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "landing-nav__link px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-500",
                variant !== "landing" && "font-light"
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {loggedIn ? (
            <>
              <Link
                href="/app"
                className="hidden md:inline-flex items-center min-h-[40px] px-4 rounded-full text-sm font-light text-[var(--text-primary)] cin-btn-ghost transition-all duration-500"
              >
                {t("navApp")}
              </Link>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 min-h-[44px] px-2.5 sm:px-3 rounded-full text-sm font-light text-[var(--text-primary)] cin-glass transition-all duration-500 shrink-0"
                >
                  <span className="w-6 h-6 rounded-full bg-[var(--accent-soft-bg)] flex items-center justify-center text-[10px] text-[var(--accent)] shrink-0">
                    {(userName ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{t("navProfile")}</span>
                </Link>
                <ThemeToggle compact className="shrink-0" />
              </div>
            </>
          ) : (
            <>
              <ThemeToggle compact className="shrink-0" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className={cn(
                  "ttm-brand-interactive inline-flex items-center justify-center min-h-[44px] rounded-full px-3 sm:px-4 text-xs sm:text-sm font-extralight text-[var(--text-secondary)] cin-btn-ghost hover:text-[var(--text-primary)]",
                  isHome && "border-[var(--border)]"
                )}
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className={cn(
                  "ttm-brand-cta inline-flex min-h-[44px] items-center justify-center text-xs sm:text-sm px-3 sm:px-4",
                  isHome && variant === "landing" && "landing-nav__cta"
                )}
              >
                {t("register")}
              </Link>
            </div>
            </>
          )}

          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] touch-manipulation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-auto mt-2 max-w-6xl rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] backdrop-blur-xl px-2 py-2 shadow-[var(--shadow-lg)]"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center rounded-xl px-4 text-sm font-light text-[var(--text-secondary)] hover:bg-[var(--accent-soft-bg)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {loggedIn && (
              <Link
                href="/app"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center rounded-xl px-4 text-sm font-light text-[var(--text-secondary)] hover:bg-[var(--accent-soft-bg)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t("navApp")}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
