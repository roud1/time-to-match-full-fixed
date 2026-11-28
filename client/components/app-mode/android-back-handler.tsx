"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { addNativeListener, callNative, nativeBridge } from "@/client/lib/capacitor-bridge"
import { canGoBackInApp } from "@/client/lib/nav-history"

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
  const backdrop = el.classList.contains("bd-sheet-backdrop") ? el : el.closest<HTMLElement>(".bd-sheet-backdrop")
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
 * users hit from most screens. With a "backButton" listener registered, Capacitor's App plugin
 * leaves Back to us. Order: close an open dialog → go back in history → return to the feed →
 * minimise the app on the feed (never kill it).
 */
export function AndroidBackHandler() {
  const router = useRouter()

  useEffect(() => {
    if (!nativeBridge()) return
    const listener = addNativeListener("App", "backButton", (data) => {
      const canGoBack = Boolean((data as { canGoBack?: boolean } | null)?.canGoBack)
      const overlay = openOverlay()
      if (overlay) {
        closeOverlay(overlay)
        return
      }
      if (canGoBack && canGoBackInApp()) {
        window.history.back()
        return
      }
      const path = window.location.pathname
      const atFeed = path === "/app" && !window.location.search
      if (!atFeed && path !== "/" && path !== "/welcome" && path !== "/login") {
        router.replace("/app")
        return
      }
      void callNative("App", "minimizeApp").catch(() => null)
    })
    return () => {
      void listener?.remove()
    }
  }, [router])

  return null
}
