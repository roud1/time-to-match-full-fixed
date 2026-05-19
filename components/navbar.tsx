"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Logo } from "@/components/logo"
import { getUserProfile, isLoggedIn } from "@/lib/user-profile"

export function Navbar() {
  const { t } = useI18n()
  const [loggedIn, setLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isLoggedIn())
      setUserName(getUserProfile()?.name ?? null)
    }
    sync()
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6"
    >
      <div className="glass rounded-2xl px-4 md:px-6 py-3 mx-auto max-w-5xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-foreground/90 font-light tracking-wide text-sm">Time to Match</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {loggedIn ? (
            <>
            <Link
              href="/app"
              className="hidden md:block px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white text-sm font-light hover:opacity-90 transition-opacity"
            >
              {t("navApp")}
            </Link>
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/90 text-sm font-light hover:bg-foreground/10 transition-all duration-300"
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
              className="hidden md:block px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/90 text-sm font-light hover:bg-foreground/10 transition-all duration-300"
            >
              {t("login")}
            </Link>
          )}
          {!loggedIn && (
            <Link
              href="/register"
              className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-light hover:opacity-90 transition-all duration-300"
            >
              {t("register")}
            </Link>
          )}
          {loggedIn && (
            <Link
              href="/profile"
              className="md:hidden w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm text-white font-light"
              aria-label={t("navProfile")}
            >
              {(userName ?? "?").charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
