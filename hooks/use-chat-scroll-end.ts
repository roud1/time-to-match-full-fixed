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

  return { ref, scrollToEnd }
}
