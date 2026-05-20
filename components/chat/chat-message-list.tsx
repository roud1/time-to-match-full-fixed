"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChatMessage } from "@/lib/social-store"
import type { Locale } from "@/lib/i18n"
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
  onReplyTo,
}: {
  messages: ChatMessage[]
  locale: Locale
  labels: Labels
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

  return (
    <div className="flex flex-col gap-4 py-2">
      {messages.map((msg) => {
        const isMe = msg.from === "me"
        const time = formatChatMessageTime(msg.at, locale)
        return (
          <ChatMessageBubble
            key={msg.id}
            msg={msg}
            isMe={isMe}
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
