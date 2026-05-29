"use client"

import { useCallback, useEffect, useState } from "react"
import { PulseCharacter } from "@/components/landing/pulse-character"
import { ChatArea } from "@/components/chat/chat-area"
import { ChatFooter } from "@/components/chat/chat-footer"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator"
import { ChatMessagesPane } from "@/components/chat/chat-messages-pane"
import { useChatScrollEnd } from "@/hooks/use-chat-scroll-end"
import { useI18n } from "@/lib/i18n"
import type { ChatThread } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { appendPulseMessage } from "@/lib/pulse/chat-store"
import { fetchPulseReply } from "@/lib/pulse/client"
import { cn } from "@/lib/utils"

type PulseChatRoomProps = {
  profile: SwipeProfile
  thread: ChatThread
  onBack: () => void
  showBack?: boolean
  layout?: "fullscreen" | "embedded"
  draft: string
  onDraftChange: (v: string) => void
  labels: {
    back: string
    bubble: {
      chatDelivered: string
      chatRead: string
      chatReply: string
      chatReact: string
    }
    composer: {
      placeholder: string
      send: string
      voiceHint: string
      voiceDemo: string
      attach: string
      mediaDemo: string
      voiceDuration: string
      replyingTo: string
      cancelReply: string
    }
  }
}

export function PulseChatRoom({
  profile,
  thread,
  onBack,
  showBack = true,
  layout = "fullscreen",
  draft,
  onDraftChange,
  labels,
}: PulseChatRoomProps) {
  const { t, locale } = useI18n()
  const [messages, setMessages] = useState(thread.messages)
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { ref: scrollRef } = useChatScrollEnd(messages.length, profile.id)
  const isEmbedded = layout === "embedded"

  useEffect(() => {
    setMessages(thread.messages)
  }, [thread.messages])

  const send = useCallback(async () => {
    const text = draft.trim()
    if (!text || typing) return
    onDraftChange("")
    setError(null)
    const withUser = appendPulseMessage("me", text)
    setMessages(withUser.messages)
    setTyping(true)
    const result = await fetchPulseReply(withUser.messages, locale)
    setTyping(false)
    if (result.ok) {
      const withReply = appendPulseMessage("them", result.text)
      setMessages(withReply.messages)
    } else {
      setError(t("pulseAiError"))
    }
  }, [draft, typing, locale, onDraftChange, t])

  return (
    <div
      className={cn(
        "ttm-chat-room ttm-pulse-chat-room flex flex-col w-full h-full min-h-0",
        isEmbedded && "ttm-chat-room--embedded"
      )}
    >
      <ChatArea
        className={isEmbedded ? "ttm-chat-area--embedded" : undefined}
        header={
          <header className="ttm-pulse-chat-header flex items-center gap-3 w-full min-w-0 px-1">
            {showBack ? (
              <button
                type="button"
                onClick={onBack}
                className="ttm-chat-room-header__icon-btn shrink-0"
                aria-label={labels.back}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-violet-600/30 border border-white/10">
                <PulseCharacter size="mini" />
              </div>
              <div className="min-w-0">
                <p className="font-extralight text-base text-white/95 truncate">{profile.name}</p>
                <p className="text-[11px] text-violet-200/70 font-light truncate">{t("pulseAiOnline")}</p>
              </div>
            </div>
          </header>
        }
        body={
          <ChatMessagesPane scrollRef={scrollRef} className="flex-1 min-h-0" innerClassName="max-w-2xl">
            <ChatMessageList
              messages={messages}
              locale={locale}
              labels={labels.bubble}
              onReplyTo={() => {}}
            />
            {typing && (
              <div className="mt-3" aria-label={t("pulseAiTyping")}>
                <span className="sr-only">{t("pulseAiTyping")}</span>
                <ChatTypingIndicator />
              </div>
            )}
            {error && (
              <p className="mt-3 text-xs text-rose-300/90 font-light text-center" role="alert">
                {error}
              </p>
            )}
          </ChatMessagesPane>
        }
        footer={
          <ChatFooter
            draft={draft}
            onDraftChange={onDraftChange}
            onSend={() => void send()}
            replySnippet={null}
            onClearReply={() => {}}
            voiceSeed={0}
            labels={{
              ...labels.composer,
              placeholder: t("pulseChatPlaceholder"),
            }}
          />
        }
      />
    </div>
  )
}
