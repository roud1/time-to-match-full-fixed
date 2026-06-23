"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { fetchRealtimeState, sendRealtimePulse, type RealtimeState } from "@/lib/chat-realtime-client"

const POLL_MS = 2500
const TYPING_DEBOUNCE_MS = 350

/**
 * Polling fallback for partner typing + presence (Phase 3).
 * When Ably/Pusher env is set, server still stores ephemeral state; clients may add WS later.
 */
export function useChatRealtime(matchId: string | null | undefined) {
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<RealtimeState>({ partnerTyping: false, partnerOnline: false })
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSent = useRef(false)

  useEffect(() => {
    if (!matchId || matchId.startsWith("local:")) {
      setState({ partnerTyping: false, partnerOnline: false })
      return
    }

    let cancelled = false

    const poll = async () => {
      const next = await fetchRealtimeState(matchId)
      if (!cancelled && next) setState(next)
    }

    void poll()
    const id = window.setInterval(poll, reduceMotion ? POLL_MS * 2 : POLL_MS)

    const onVis = () => {
      if (document.visibilityState === "visible") void poll()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [matchId, reduceMotion])

  const reportDraftChange = (draft: string) => {
    if (!matchId || matchId.startsWith("local:")) return

    const isTyping = draft.trim().length > 0
    if (typingTimer.current) clearTimeout(typingTimer.current)

    typingTimer.current = setTimeout(() => {
      if (lastTypingSent.current === isTyping) return
      lastTypingSent.current = isTyping
      void sendRealtimePulse(matchId, isTyping).then((next) => {
        if (next) setState(next)
      })
    }, TYPING_DEBOUNCE_MS)
  }

  const reportStoppedTyping = () => {
    if (!matchId || matchId.startsWith("local:")) return
    if (!lastTypingSent.current) return
    lastTypingSent.current = false
    void sendRealtimePulse(matchId, false)
  }

  return {
    partnerTyping: state.partnerTyping,
    partnerOnline: state.partnerOnline,
    reportDraftChange,
    reportStoppedTyping,
  }
}
