"use client"

import { Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LanguageSwitcher } from "@/client/components/language-switcher"
import { ThemeToggle } from "@/client/components/theme/theme-toggle"
import { cn } from "@/client/lib/utils"

const AUTH_PATHS = new Set(["/login", "/register", "/admin"])

function FloatingChromeInner() {
  const pathname = usePathname() ?? ""
  const searchParams = useSearchParams()
  const isHome = pathname === "/"
  const isApp = pathname === "/app" || pathname.startsWith("/app/")
  const isAuth = AUTH_PATHS.has(pathname)
  const chatThreadOpen = isApp && searchParams.get("with") != null
  const aboveDock = isApp && !chatThreadOpen

  if (isHome) return null

  return (
    <div
      className={cn("ttm-floating-chrome", aboveDock && "ttm-floating-chrome--above-dock")}
      aria-label="Settings"
    >
      {!isAuth && !isApp && <ThemeToggle compact className="ttm-floating-chrome__theme" />}
      <LanguageSwitcher />
    </div>
  )
}

/** Bottom-right theme + language (fixed while scrolling). */
export function FloatingChrome() {
  return (
    <Suspense fallback={null}>
      <FloatingChromeInner />
    </Suspense>
  )
}
