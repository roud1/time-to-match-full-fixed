"use client"

import { motion } from "motion/react"
import { PulseCharacter } from "@/client/components/landing/pulse-character"
import { formatChatThreadPreviewTime } from "@/client/lib/format-chat-time"
import type { ChatThread } from "@/client/lib/social-store"
import type { Locale } from "@/client/lib/i18n"
import { useI18n } from "@/client/lib/i18n"
import { cn } from "@/client/lib/utils"

export function PulseInboxRow({
  thread,
  locale,
  isActive,
  onOpen,
}: {
  thread: ChatThread
  locale: Locale
  isActive?: boolean
  onOpen: () => void
}) {
  const { t } = useI18n()
  const last = thread.messages[thread.messages.length - 1]
  const previewTime = formatChatThreadPreviewTime(last?.at ?? thread.updatedAt, locale)

  return (
    <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "ttm-pulse-inbox-row w-full rounded-[1.35rem] px-3.5 py-3 flex items-center gap-3.5 text-left touch-manipulation min-h-[80px]",
          "border border-violet-500/25 bg-gradient-to-r from-violet-950/40 via-[#0c0c14] to-orange-950/20",
          "backdrop-blur-xl transition-all active:scale-[0.99]",
          isActive && "ttm-chat-inbox__row--active border-orange-400/45"
        )}
      >
        <div className="relative shrink-0 w-14 h-14 flex items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10">
          <PulseCharacter size="mini" />
          <span className="absolute -top-0.5 -right-0.5 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/90 text-white font-medium">
            {t("pulseInboxBadge")}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[15px] truncate text-foreground">Pulse</p>
            <span className="shrink-0 text-[9px] uppercase tracking-wider text-violet-300/80">
              {t("pulseGuideLabel")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-normal truncate mt-0.5">
            {last?.text ?? t("pulseInboxPreview")}
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums font-normal shrink-0">
          {previewTime}
        </span>
      </button>
    </motion.li>
  )
}
