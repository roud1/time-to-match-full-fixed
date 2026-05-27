"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type ChatAreaProps = {
  header: ReactNode
  body: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Isolated flex column for chat: header / scrollable body / pinned footer.
 * No outer margins — parent (.ttm-chat-room) owns atmosphere data-attrs only.
 */
export function ChatArea({ header, body, footer, className }: ChatAreaProps) {
  return (
    <div className={cn("ttm-chat-area", className)}>
      <div className="ttm-chat-area__header">{header}</div>
      <div className="ttm-chat-area__body">{body}</div>
      {footer ? <div className="ttm-chat-area__footer">{footer}</div> : null}
    </div>
  )
}
