"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ChatDesktopShellProps = {
  list: ReactNode
  main: ReactNode
  side?: ReactNode
  className?: string
}

/** Two-column messenger: inbox · thread (xl+ optional side rail) */
export function ChatDesktopShell({ list, main, side, className }: ChatDesktopShellProps) {
  return (
    <div
      className={cn(
        "ttm-chat-desktop w-full mx-auto",
        side && "ttm-chat-desktop--with-side",
        className
      )}
    >
      <div className="ttm-chat-desktop__list">{list}</div>
      <div className="ttm-chat-desktop__main">{main}</div>
      {side ? <div className="ttm-chat-desktop__side">{side}</div> : null}
    </div>
  )
}
