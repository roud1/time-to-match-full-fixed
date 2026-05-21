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
    <div className={cn("ttm-chat-desktop w-full max-w-[1600px] mx-auto min-h-[calc(100dvh-8rem)]", className)}>
      <div className="ttm-chat-desktop__list min-h-0">{list}</div>
      <div className="ttm-chat-desktop__main min-h-0 flex flex-col">{main}</div>
      {side ? <div className="ttm-chat-desktop__side min-h-0">{side}</div> : null}
    </div>
  )
}
