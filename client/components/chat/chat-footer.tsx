"use client"

import type { ReactNode } from "react"
import { ChatComposer } from "@/client/components/chat/chat-composer"

type ChatComposerLabels = {
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

export type ChatFooterProps = {
  draft: string
  onDraftChange: (v: string) => void
  onSend: () => void
  replySnippet: string | null
  onClearReply: () => void
  voiceSeed: number
  disabled?: boolean
  disabledHint?: string
  labels: ChatComposerLabels
  beforeComposer?: ReactNode
}

export function ChatFooter({
  draft,
  onDraftChange,
  onSend,
  replySnippet,
  onClearReply,
  voiceSeed,
  disabled,
  disabledHint,
  labels,
  beforeComposer,
}: ChatFooterProps) {
  return (
    <div className="ttm-chat-composer-wrap ttm-chat-composer">
      {beforeComposer ? <div className="ttm-chat-icebreakers">{beforeComposer}</div> : null}
      <ChatComposer
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        replySnippet={replySnippet}
        onClearReply={onClearReply}
        voiceSeed={voiceSeed}
        disabled={disabled}
        disabledHint={disabledHint}
        labels={labels}
      />
    </div>
  )
}
