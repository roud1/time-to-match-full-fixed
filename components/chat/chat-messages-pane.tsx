"use client"

import type { ReactNode, RefObject } from "react"
import { cn } from "@/lib/utils"

export type ChatMessagesPaneProps = {
  scrollRef?: RefObject<HTMLDivElement | null>
  className?: string
  innerClassName?: string
  /** Absolute layers (ambient bg, pulse) inside scroll viewport */
  overlay?: ReactNode
  before?: ReactNode
  children: ReactNode
  after?: ReactNode
}

export function ChatMessagesPane({
  scrollRef,
  className,
  innerClassName,
  overlay,
  before,
  children,
  after,
}: ChatMessagesPaneProps) {
  return (
    <div
      ref={scrollRef}
      className={cn("ttm-chat-area__scroll ttm-chat-scroll", className)}
    >
      {overlay}
      <div className={cn("ttm-chat-area__scroll-inner", innerClassName)}>
        {before}
        {children}
        {after}
      </div>
    </div>
  )
}
