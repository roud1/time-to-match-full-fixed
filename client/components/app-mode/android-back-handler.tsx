"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

type BackButtonEvent = { canGoBack: boolean }
type CapacitorAppPlugin = {
  addListener: (event: "backButton", cb: (e: BackButtonEvent) => void) => Promise<{ remove: () => Promise<void> }> | { remove: () => Promise<void> }
  minimizeApp?: () => Promise<void>
  exitApp?: () => Promise<void>
}
type CapacitorGlobal = {
  isNativePlatform?: () => boolean
  getPlatform?: () => string
  Plugins?: { App?: CapacitorAppPlugin }
}

/** A dialog, sheet or menu that is open and visible right now. */
function openOverlay(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"], .bd-sheet-backdrop, [data-state="open"][data-radix-popper-content-wrapper]'
  )
  for (const el of candidates) {
    if (el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden") return el
  }
  return null
}

function closeOverlay(el: HTMLElement): void {
  // Our own sheets close when their backdrop is tapped.
  if (el.classList.contains("bd-sheet-backdrop")) {
    el.click()
    return
  }
  const backdrop = el.closest<HTMLElement>(".bd-sheet-backdrop")
  if (backdrop) {
    backdrop.click()
    return
  }
  // Radix dialogs / sheets and most custom modals close on Escape.
  const esc = { key: "Escape", code: "Escape", keyCode: 27, bubbles: true, cancelable: true }
  el.dispatchEvent(new KeyboardEvent("keydown", esc))
  document.dispatchEvent(new KeyboardEvent("keydown", esc))
}

/**
 * Android app (Capacitor shell): the system Back button / back swipe.
 * Without a listener Capacitor closes the app as soon as the page has no history, which is what
 * users hit from most screens. Order: close an open dialog → go back in history → return to the
 * feed → minimise the app on the feed (never kill it).
 */
export function AndroidBackHandler() {
  const router = useRouter()

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor
    const app = cap?.Plugins?.App
    const native = cap?.isNativePlatform?.() ?? cap?.getPlatform?.() === "android"
    if (!native || !app?.addListener) return

    let removed = false
    let remove: (() => Promise<void>) | null = null
    const result = app.addListener("backButton", ({ canGoBack }) => {
      const overlay = openOverlay()
      if (overlay) {
        closeOverlay(overlay)
        return
      }
      if (canGoBack && window.history.length > 1) {
        window.history.back()
        return
      }
      const atFeed = window.location.pathname === "/app" && !window.location.search
      if (!atFeed && window.location.pathname !== "/" && window.location.pathname !== "/welcome") {
        router.replace("/app")
        return
      }
      if (app.minimizeApp) void app.minimizeApp()
    })
    void Promise.resolve(result).then((handle) => {
      if (removed) void handle.remove()
      else remove = handle.remove
    })
    return () => {
      removed = true
      if (remove) void remove()
    }
  }, [router])

  return null
}
