"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { fetchRealtimeState, sendRealtimePulse, type RealtimeState } from "@/lib/chat-realtime-client"
import { isRealtimeWebSocketConfigured } from "@/lib/realtime/client"
import { REALTIME_EVENTS } from "@/lib/realtime/types"
import { useRealtimeChannel } from "@/hooks/use-realtime-channel"

const POLL_MS = 2500
const POLL_WS_MS = 12_000
const TYPING_DEBOUNCE_MS = 350

type UseChatRealtimeOptions = {
  peerUserId?: string | null
}

/**
 * Partner typing + presence — WebSocket when configured, HTTP polling fallback.
 */
export function useChatRealtime(
  matchId: string | null | undefined,
  options: UseChatRealtimeOptions = {}
) {
  const { peerUserId } = options
  const reduceMotion = useReducedMotion()
  const [state, setState] = useState<RealtimeState>({ partnerTyping: false, partnerOnline: false })
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSent = useRef(false)
  const peerRef = useRef(peerUserId)

  useEffect(() => {
    peerRef.current = peerUserId
  }, [peerUserId])

  const onRealtimeEvent = useCallback(
    (event: string, payload: { userId: string; typing?: boolean; online?: boolean }) => {
      const peer = peerRef.current
      if (peer && payload.userId !== peer) return

      if (event === REALTIME_EVENTS.typing) {
        setState((prev) => ({ ...prev, partnerTyping: Boolean(payload.typing) }))
        return
      }
      if (event === REALTIME_EVENTS.presence) {
        setState((prev) => ({ ...prev, partnerOnline: Boolean(payload.online) }))
      }
    },
    []
  )

  const { connected: wsConnected } = useRealtimeChannel(
    isRealtimeWebSocketConfigured() ? matchId : null,
    onRealtimeEvent
  )

  useEffect(() => {
    if (!matchId || matchId.startsWith("local:")) {
      setState({ partnerTyping: false, partnerOnline: false })
      return
    }

    let cancelled = false
    const basePoll = reduceMotion ? POLL_MS * 2 : POLL_MS
    const intervalMs = wsConnected ? POLL_WS_MS : basePoll

    const poll = async () => {
      const next = await fetchRealtimeState(matchId)
      if (!cancelled && next) setState(next)
    }

    void poll()
    const id = window.setInterval(poll, intervalMs)

    const onVis = () => {
      if (document.visibilityState === "visible") void poll()
    }
    document.addEventListener("visibilitychange", onVis)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [matchId, reduceMotion, wsConnected])

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
    wsConnected,
    reportDraftChange,
    reportStoppedTyping,
  }
}
