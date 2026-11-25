"use client"

import { useEffect } from "react"
import { applyLvTheme, readLvThemePref, resolveLvTheme } from "@/client/lib/lv-theme"

/** Keeps "follow the system" in sync when the phone switches between light and dark. */
export function LvThemeSync() {
  useEffect(() => {
    // Re-apply once mounted: the meta tags may not have existed yet when the head script ran.
    applyLvTheme(resolveLvTheme(readLvThemePref()))
    const mq = window.matchMedia?.("(prefers-color-scheme: light)")
    if (!mq) return
    const onChange = () => {
      if (readLvThemePref() === "system") applyLvTheme(resolveLvTheme("system"))
    }
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [])
  return null
}
