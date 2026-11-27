"use client"

import { useEffect } from "react"

/**
 * iPhone: the on-screen keyboard does not shrink the layout (100% / 100dvh stay the full screen);
 * Safari pushes the page up instead, so headers and the newest messages leave the screen and the
 * composer floats above an empty gap. While `active`, this publishes the VISIBLE area on <html>:
 *   --kb-vh  visible height, --kb-vt  its offset from the top, [data-kb] while the keyboard is open.
 * Screens opt in with CSS (see the chat room in app-chats.css).
 */
export function useKeyboardViewport(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    let fullHeight = vv.height
    const fit = () => {
      fullHeight = Math.max(fullHeight, vv.height)
      const open = vv.height < fullHeight * 0.75
      root.toggleAttribute("data-kb", open)
      root.style.setProperty("--kb-vh", `${vv.height}px`)
      root.style.setProperty("--kb-vt", `${vv.offsetTop}px`)
      if (open) window.dispatchEvent(new Event("ttm-keyboard-open"))
    }
    fit()
    vv.addEventListener("resize", fit)
    vv.addEventListener("scroll", fit)
    return () => {
      vv.removeEventListener("resize", fit)
      vv.removeEventListener("scroll", fit)
      root.removeAttribute("data-kb")
      root.style.removeProperty("--kb-vh")
      root.style.removeProperty("--kb-vt")
    }
  }, [active])
}
