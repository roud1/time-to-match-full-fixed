"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ChatMessage } from "@/client/lib/social-store"
import {
  getSocketClient,
  getSocketConnectionState,
  isSocketConfigured,
} from "@/client/lib/realtime/socket/socket-client"
import type { SocketMessageAck } from "@/client/lib/realtime/socket/types"

const TYPING_DEBOUNCE_MS = 350

export type UseSocketChatOptions = {
  peerUserId?: string | null
  onMessage?: (message: ChatMessage) => void
}

function socketMessageToChat(
  msg: { id: string; senderId: string; body: string; createdAt: string },
  myUserId: string | null,
  peerUserId: string | null
): ChatMessage {
  const from: "me" | "them" =
    myUserId && msg.senderId === myUserId
      ? "me"
      : peerUserId && msg.senderId === peerUserId
        ? "them"
        : "them"
  return {
    id: msg.id,
    from,
    text: msg.body,
    at: new Date(msg.createdAt).getTime(),
  }
}

/**
 * Real-time match chat over Socket.io — messages, typing, presence.
 * No-op when `NEXT_PUBLIC_SOCKET_URL` is unset (use Pusher/polling instead).
 */
export function useSocketChat(
  matchId: string | null | undefined,
  options: UseSocketChatOptions = {}
) {
  const { peerUserId, onMessage } = options
  const [connected, setConnected] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingSent = useRef(false)
  const onMessageRef = useRef(onMessage)
  const peerRef = useRef(peerUserId)
  const myUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    peerRef.current = peerUserId
  }, [peerUserId])

  useEffect(() => {
    if (!isSocketConfigured() || !matchId || matchId.startsWith("local:")) {
      setConnected(false)
      setPartnerTyping(false)
      setPartnerOnline(false)
      return
    }

    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      const client = await getSocketClient()
      if (!client || cancelled) return

      const onConnect = () => {
        setConnected(true)
        client.emit("join:match", { matchId })
      }
      const onDisconnect = () => setConnected(false)

      const isPeer = (userId: string) => {
        const peer = peerRef.current
        return !peer || userId === peer
      }

      const onMessageNew = (payload: { message: { id: string; senderId: string; body: string; createdAt: string; matchId: string } }) => {
        if (payload.message.matchId !== matchId) return
        const chatMsg = socketMessageToChat(
          payload.message,
          myUserIdRef.current,
          peerRef.current ?? null
        )
        setMessages((prev) => (prev.some((m) => m.id === chatMsg.id) ? prev : [...prev, chatMsg]))
        onMessageRef.current?.(chatMsg)
      }

      const onTypingStart = (payload: { matchId: string; userId: string }) => {
        if (payload.matchId !== matchId || !isPeer(payload.userId)) return
        setPartnerTyping(true)
      }

      const onTypingStop = (payload: { matchId: string; userId: string }) => {
        if (payload.matchId !== matchId || !isPeer(payload.userId)) return
        setPartnerTyping(false)
      }

      const onPresenceOnline = (payload: { matchId: string; userId: string }) => {
        if (payload.matchId !== matchId || !isPeer(payload.userId)) return
        setPartnerOnline(true)
      }

      const onPresenceOffline = (payload: { matchId: string; userId: string }) => {
        if (payload.matchId !== matchId || !isPeer(payload.userId)) return
        setPartnerOnline(false)
      }

      client.on("connect", onConnect)
      client.on("disconnect", onDisconnect)
      client.on("message:new", onMessageNew)
      client.on("typing:start", onTypingStart)
      client.on("typing:stop", onTypingStop)
      client.on("presence:online", onPresenceOnline)
      client.on("presence:offline", onPresenceOffline)

      if (client.connected) onConnect()
      else setConnected(getSocketConnectionState() === "connected")

      cleanup = () => {
        client.off("connect", onConnect)
        client.off("disconnect", onDisconnect)
        client.off("message:new", onMessageNew)
        client.off("typing:start", onTypingStart)
        client.off("typing:stop", onTypingStop)
        client.off("presence:online", onPresenceOnline)
        client.off("presence:offline", onPresenceOffline)
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
      setConnected(false)
      setPartnerTyping(false)
      setPartnerOnline(false)
    }
  }, [matchId])

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      if (!matchId || matchId.startsWith("local:") || !isSocketConfigured()) return
      void getSocketClient().then((client) => {
        if (!client?.connected) return
        client.emit(isTyping ? "typing:start" : "typing:stop", { matchId })
      })
    },
    [matchId]
  )

  const reportDraftChange = useCallback(
    (draft: string) => {
      if (!matchId || matchId.startsWith("local:")) return
      const isTyping = draft.trim().length > 0
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        if (lastTypingSent.current === isTyping) return
        lastTypingSent.current = isTyping
        emitTyping(isTyping)
      }, TYPING_DEBOUNCE_MS)
    },
    [matchId, emitTyping]
  )

  const reportStoppedTyping = useCallback(() => {
    if (!lastTypingSent.current) return
    lastTypingSent.current = false
    emitTyping(false)
  }, [emitTyping])

  const sendMessage = useCallback(
    (text: string): Promise<SocketMessageAck> => {
      const trimmed = text.trim()
      if (!trimmed || !matchId || matchId.startsWith("local:")) {
        return Promise.resolve({ ok: false, code: "invalid", message: "Empty message" })
      }

      return new Promise((resolve) => {
        void getSocketClient().then((client) => {
          if (!client?.connected) {
            resolve({ ok: false, code: "disconnected", message: "Socket not connected" })
            return
          }
          client.emit("message:send", { matchId, text: trimmed }, (ack) => {
            if (ack?.ok && ack.message) {
              myUserIdRef.current = ack.message.senderId
              const chatMsg = socketMessageToChat(
                ack.message,
                ack.message.senderId,
                peerRef.current ?? null
              )
              setMessages((prev) =>
                prev.some((m) => m.id === chatMsg.id) ? prev : [...prev, chatMsg]
              )
            }
            resolve(ack ?? { ok: false, code: "no_ack", message: "No acknowledgement" })
          })
        })
      })
    },
    [matchId]
  )

  return {
    connected,
    messages,
    partnerTyping,
    isPartnerOnline: partnerOnline,
    typingUsers: partnerTyping && peerUserId ? [peerUserId] : [],
    sendMessage,
    emitTyping,
    reportDraftChange,
    reportStoppedTyping,
  }
}
