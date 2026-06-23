"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { fetchOnlineMap } from "@/lib/chat-realtime-client"
import { getClientRealtimeKind, subscribeMatchChannel, unsubscribeMatchChannel } from "@/lib/realtime/client"
import { REALTIME_EVENTS } from "@/lib/realtime/types"

const POLL_MS = 30_000
const POLL_WS_MS = 60_000

export type MatchPresenceEntry = {
  peerUserId: string
  matchId?: string
}

/** Batch online presence for match list — WebSocket per match channel when configured. */
export function useMatchPresence(entries: MatchPresenceEntry[]) {
  const [online, setOnline] = useState<Record<string, boolean>>({})
  const [wsConnected, setWsConnected] = useState(false)

  const channelSpecs = useMemo(
    () =>
      entries
        .filter((e) => e.peerUserId && e.matchId && !e.matchId.startsWith("local:"))
        .map((e) => ({ matchId: e.matchId!, peerUserId: e.peerUserId })),
    [entries]
  )

  const peerIds = useMemo(
    () => [...new Set(entries.map((e) => e.peerUserId).filter(Boolean))],
    [entries]
  )

  const channelKey = useMemo(
    () => channelSpecs.map((s) => `${s.matchId}:${s.peerUserId}`).sort().join("|"),
    [channelSpecs]
  )

  const applyPresence = useCallback((userId: string, isOnline: boolean) => {
    setOnline((prev) => {
      if (prev[userId] === isOnline) return prev
      return { ...prev, [userId]: isOnline }
    })
  }, [])

  useEffect(() => {
    if (!peerIds.length) {
      setOnline({})
      return
    }

    let cancelled = false

    const refresh = async () => {
      const map = await fetchOnlineMap(peerIds)
      if (!cancelled) setOnline(map)
    }

    void refresh()
    const pollMs = wsConnected ? POLL_WS_MS : POLL_MS
    const pollId = window.setInterval(refresh, pollMs)

    return () => {
      cancelled = true
      clearInterval(pollId)
    }
  }, [peerIds, wsConnected])

  useEffect(() => {
    if (getClientRealtimeKind() !== "pusher" || !channelSpecs.length) {
      setWsConnected(false)
      return
    }

    let activeSubs = 0
    const cleanups: (() => void)[] = []

    for (const { matchId, peerUserId } of channelSpecs) {
      const channel = subscribeMatchChannel(matchId)
      if (!channel) continue

      const onPresence = (data: { userId: string; online?: boolean }) => {
        if (data.userId !== peerUserId) return
        applyPresence(peerUserId, Boolean(data.online))
      }

      const onSubscribed = () => {
        activeSubs += 1
        setWsConnected(activeSubs > 0)
      }

      channel.bind("pusher:subscription_succeeded", onSubscribed)
      channel.bind(REALTIME_EVENTS.presence, onPresence)

      cleanups.push(() => {
        channel.unbind("pusher:subscription_succeeded", onSubscribed)
        channel.unbind(REALTIME_EVENTS.presence, onPresence)
        unsubscribeMatchChannel(matchId)
      })
    }

    return () => {
      for (const cleanup of cleanups) cleanup()
      setWsConnected(false)
    }
  }, [channelKey, channelSpecs, applyPresence])

  return online
}
