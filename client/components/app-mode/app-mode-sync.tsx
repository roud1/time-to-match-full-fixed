"use client"

import { useEffect } from "react"
import { applyTheme } from "@/client/lib/theme"

/**
 * Safety net: the `data-ttm-app` flag is set by an inline script before first paint (app/layout.tsx).
 * If React ever rebuilds the document (e.g. after a hydration mismatch) the flag can be lost, which would
 * switch the whole screen to website styles. Re-assert it (and the dark theme) whenever it is missing.
 */
export function AppModeSync() {
  useEffect(() => {
    const root = document.documentElement
    if (root.hasAttribute("data-ttm-app")) return
    const nav = navigator as Navigator & { standalone?: boolean }
    const inApp =
      /TTMApp/.test(navigator.userAgent || "") ||
      nav.standalone === true ||
      window.matchMedia?.("(display-mode: standalone)").matches === true
    if (inApp) {
      root.setAttribute("data-ttm-app", "1")
      applyTheme("dark")
    }
  })
  return null
}
