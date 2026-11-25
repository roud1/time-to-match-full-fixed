"use client"

import "./app-mode.css"
import "./luvia-tokens.css"
import "./luvia-light-generated.css"
import "./luvia-light.css"
// Loaded from the root layout: in production builds the CSS of portal screens (match) was split into a chunk /app never requested.
import "@/client/components/app/match-celebration-luvia.css"
import "@/client/components/premium/premium-luvia.css"
import "@/app/settings/settings-luvia.css"
import "@/client/components/profile/profile-edit-luvia.css"
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
