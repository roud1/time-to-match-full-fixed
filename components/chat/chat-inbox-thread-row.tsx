"use client"

import { motion } from "motion/react"
import type { ChatThread } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import { formatChatThreadPreviewTime } from "@/lib/format-chat-time"
import type { Locale } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n"
import { hasUnreadThread } from "@/lib/chat-thread-seen"
import { ChatProfileAvatar } from "@/components/chat/chat-profile-avatar"
import { useConnectionLive } from "@/hooks/use-connection-live"
import { buildConnectionCopy } from "@/lib/connection-copy"
import { stageLabel } from "@/lib/connection-system"
import { deriveSyncMetrics } from "@/lib/sync-system"
import { isPulseProfile } from "@/lib/pulse-companion"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { cn } from "@/lib/utils"

export function ChatInboxThreadRow({
  thread,
  profile,
  locale,
  index,
  unreadLabel,
  paused = false,
  onOpen,
}: {
  thread: ChatThread
  profile: SwipeProfile
  locale: Locale
  index: number
  unreadLabel: string
  paused?: boolean
  onOpen: (profileId: number) => void
}) {
  const { t } = useI18n()
  const last = thread.messages[thread.messages.length - 1]
  const unread = hasUnreadThread(thread.profileId, thread.updatedAt, last?.from === "them")
  const previewTime = formatChatThreadPreviewTime(last?.at ?? thread.updatedAt, locale)
  const connectionView = useConnectionLive(thread.profileId)
  const copy = buildConnectionCopy(t)
  const syncMetrics = deriveSyncMetrics(connectionView ?? null, { recentActivity: unread })
  const isPulse = isPulseProfile(thread.profileId)

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25), type: "spring", stiffness: 380, damping: 28 }}
    >
      <button
        type="button"
        onClick={() => onOpen(thread.profileId)}
        className={cn(
          "w-full rounded-[1.35rem] p-3 flex items-center gap-3 text-left touch-manipulation min-h-[80px] transition-all duration-300",
          "border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl",
          isPulse && "border-white/15 bg-white/[0.05]",
          paused && "opacity-75 saturate-[0.85]",
          connectionView?.isFading && "border-amber-500/20 bg-amber-500/[0.03] ttm-connection-fading",
          connectionView?.urgency === "critical" && "border-amber-500/25",
          connectionView?.stage === "stable" && "border-white/15",
          "hover:border-white/18 hover:bg-white/[0.05] active:scale-[0.99]"
        )}
        style={
          connectionView?.isFading
            ? { ["--ttm-fade" as string]: connectionView.fadeIntensity }
            : undefined
        }
      >
        <ChatProfileAvatar
          src={profile.image}
          name={profile.name}
          profileId={profile.id}
          syncMetrics={syncMetrics}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-extralight text-[15px] truncate text-white/95">{profile.name}</p>
            {isPulse && (
              <span className="shrink-0 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/15 text-white/50">
                AI
              </span>
            )}
            {syncMetrics && (
              <span className="shrink-0 text-[9px] tabular-nums uppercase tracking-wider text-white/40">
                SYNC {syncMetrics.syncPercent}%
              </span>
            )}
            {unread && (
              <span className="shrink-0 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                {unreadLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-white/45 font-extralight truncate mt-0.5">{last?.text}</p>
          {connectionView && (
            <p className="text-[10px] text-white/35 font-extralight mt-1 truncate">
              {stageLabel(connectionView.stage, copy)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[10px] text-white/35 tabular-nums font-extralight">{previewTime}</span>
          {connectionView && (
            <ConnectionTimer view={connectionView} compact stableLabel={copy.stableLabel} />
          )}
        </div>
      </button>
    </motion.li>
  )
}
