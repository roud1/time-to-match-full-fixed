"use client"

import { useEffect, useRef, useState } from "react"
import {
  getClientRealtimeKind,
  getPusherClient,
  subscribeMatchChannel,
  unsubscribeMatchChannel,
} from "@/client/lib/realtime/client"
import type { MatchRealtimePayload, RealtimeEventName } from "@/client/lib/realtime/types"
import { REALTIME_EVENTS } from "@/client/lib/realtime/types"

export type RealtimeChannelHandler = (event: RealtimeEventName, payload: MatchRealtimePayload) => void

/**
 * Subscribe to a private match channel when WebSocket realtime is configured.
 * Returns `connected` when the channel subscription succeeds.
 */
export function useRealtimeChannel(
  matchId: string | null | undefined,
  onEvent: RealtimeChannelHandler
) {
  const [connected, setConnected] = useState(false)
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!matchId || matchId.startsWith("local:")) {
      setConnected(false)
      return
    }

    if (getClientRealtimeKind() !== "pusher") {
      setConnected(false)
      return
    }

    const channel = subscribeMatchChannel(matchId)
    if (!channel) {
      setConnected(false)
      return
    }

    const dispatch = (event: RealtimeEventName) => (data: MatchRealtimePayload) => {
      handlerRef.current(event, data)
    }

    const onTyping = dispatch(REALTIME_EVENTS.typing)
    const onPresence = dispatch(REALTIME_EVENTS.presence)
    const onMessage = dispatch(REALTIME_EVENTS.message)

    const onSubscribed = () => setConnected(true)
    const onError = () => setConnected(false)

    channel.bind("pusher:subscription_succeeded", onSubscribed)
    channel.bind("pusher:subscription_error", onError)
    channel.bind(REALTIME_EVENTS.typing, onTyping)
    channel.bind(REALTIME_EVENTS.presence, onPresence)
    channel.bind(REALTIME_EVENTS.message, onMessage)

    const pusher = getPusherClient()
    const onConnectionChange = (state: { current: string }) => {
      if (state.current === "disconnected") setConnected(false)
    }
    pusher?.connection.bind("state_change", onConnectionChange)

    return () => {
      channel.unbind("pusher:subscription_succeeded", onSubscribed)
      channel.unbind("pusher:subscription_error", onError)
      channel.unbind(REALTIME_EVENTS.typing, onTyping)
      channel.unbind(REALTIME_EVENTS.presence, onPresence)
      channel.unbind(REALTIME_EVENTS.message, onMessage)
      pusher?.connection.unbind("state_change", onConnectionChange)
      unsubscribeMatchChannel(matchId)
      setConnected(false)
    }
  }, [matchId])

  return { connected }
}
