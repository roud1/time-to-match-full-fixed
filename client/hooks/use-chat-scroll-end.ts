"use client"

import { useCallback, useEffect, useRef } from "react"

export function useChatScrollEnd(messageCount: number, threadId: number | null) {
  const ref = useRef<HTMLDivElement>(null)

  const scrollToEnd = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    scrollToEnd("auto")
  }, [messageCount, threadId, scrollToEnd])

  // The keyboard opened (iPhone): keep the newest message right above the composer.
  useEffect(() => {
    const onKb = () => scrollToEnd("auto")
    window.addEventListener("ttm-keyboard-open", onKb)
    return () => window.removeEventListener("ttm-keyboard-open", onKb)
  }, [scrollToEnd])

  return { ref, scrollToEnd }
}
