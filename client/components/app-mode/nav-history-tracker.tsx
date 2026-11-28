"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { getNavDepth, setNavDepth } from "@/client/lib/nav-history"

/** Screens where the app may start; Back there is the platform's business (minimise / close). */
const ENTRY_PATHS = new Set(["/", "/app", "/welcome", "/login", "/register"])

function isInstalledApp(): boolean {
  return document.documentElement.hasAttribute("data-ttm-app")
}

/**
 * Counts in-app navigations for `safeBack` (client/lib/nav-history) and, when the installed app
 * is opened straight onto an inner screen (e.g. from a notification), puts the feed underneath
 * it, so the system Back button returns to the feed instead of closing the app.
 */
export function NavHistoryTracker() {
  const pathname = usePathname()
  const search = useSearchParams()
  const first = useRef(true)
  const popped = useRef(false)

  useEffect(() => {
    const onPop = () => {
      popped.current = true
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
      // A reload keeps the count of this tab; any other fresh page load starts from zero.
      if (nav?.type !== "reload") setNavDepth(0)
      if (getNavDepth() === 0 && isInstalledApp() && !ENTRY_PATHS.has(pathname)) {
        const here = window.location.pathname + window.location.search + window.location.hash
        window.history.replaceState(null, "", "/app")
        window.history.pushState(null, "", here)
        setNavDepth(1)
      }
      return
    }
    if (popped.current) {
      popped.current = false
      setNavDepth(getNavDepth() - 1)
    } else {
      setNavDepth(getNavDepth() + 1)
    }
  }, [pathname, search])

  return null
}
