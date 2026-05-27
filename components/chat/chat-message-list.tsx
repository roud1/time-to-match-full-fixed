"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"
import type { SyncTier } from "@/lib/sync-system"
import { formatChatMessageTime } from "@/lib/format-chat-time"
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble"

type Labels = {
  chatDelivered: string
  chatRead: string
  chatReply: string
  chatReact: string
}

export function ChatMessageList({
  messages,
  locale,
  labels,
  syncTier,
  highlightLatest,
  onReplyTo,
}: {
  messages: ChatMessage[]
  locale: Locale
  labels: Labels
  syncTier?: SyncTier
  highlightLatest?: boolean
  onReplyTo: (snippet: string) => void
}) {
  const [reactions, setReactions] = useState<Record<string, string>>({})
  const lastOwnId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === "me") return messages[i].id
    }
    return null as string | null
  }, [messages])

  const [receipt, setReceipt] = useState<"delivered" | "read">("delivered")

  useEffect(() => {
    if (!lastOwnId) return
    setReceipt("delivered")
    const t = window.setTimeout(() => setReceipt("read"), 1200)
    return () => clearTimeout(t)
  }, [lastOwnId])

  const lastId = messages[messages.length - 1]?.id

  return (
    <div className="ttm-chat-messages flex flex-col py-1">
      {messages.map((msg, index) => {
        if (msg.from === "system") {
          return (
            <p
              key={msg.id}
              className="mx-auto my-2 max-w-[min(92%,18rem)] rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 text-center text-[10px] sm:text-[11px] font-light text-amber-100/90 leading-snug"
              role="status"
            >
              {msg.text}
            </p>
          )
        }
        const isMe = msg.from === "me"
        const time = formatChatMessageTime(msg.at, locale)
        const isLatest = msg.id === lastId
        return (
          <ChatMessageBubble
            key={msg.id}
            msg={msg}
            isMe={isMe}
            index={index}
            syncTier={syncTier}
            arriveSurge={highlightLatest && isLatest}
            showOwnReceipt={isMe && msg.id === lastOwnId}
            receiptState={receipt}
            time={time}
            reaction={reactions[msg.id] ?? null}
            onPickReaction={(emoji) => setReactions((r) => ({ ...r, [msg.id]: emoji }))}
            onReply={() => onReplyTo(msg.text.slice(0, 120))}
            labels={labels}
          />
        )
      })}
    </div>
  )
}
