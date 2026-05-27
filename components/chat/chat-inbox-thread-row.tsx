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
import { getConnection } from "@/lib/connection-store"
import { resolveEmotionalPresence } from "@/lib/world"
import { ConnectionTimer } from "@/components/connection/connection-timer"
import { useMatchForProfile } from "@/hooks/use-matches"
import { getLocalBondState } from "@/lib/match-bond-local"
import { BOND_PROLONG_HOURS } from "@/lib/server/matches/bond-constants"
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
  const record = connectionView ? getConnection(connectionView.profileId) : undefined
  const syncMetrics = deriveSyncMetrics(connectionView ?? null, {
    recentActivity: unread,
    messages: thread.messages,
    record,
  })
  const inboxPresence = resolveEmotionalPresence(thread.profileId, {
    thread,
    view: connectionView ?? null,
    syncMetrics,
  })
  const serverMatch = useMatchForProfile(thread.profileId)
  const localBond = getLocalBondState(thread.profileId)
  const prolongCount = serverMatch?.bond.prolongCount ?? localBond.prolongCount
  const bondActive = prolongCount > 0

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
          "ttm-surface-tile w-full rounded-[1.35rem] p-3 flex items-center gap-3 text-left touch-manipulation min-h-[80px] transition-all duration-300 backdrop-blur-xl",
          paused && "opacity-75 saturate-[0.85]",
          connectionView?.isFading && "border-amber-500/30 bg-amber-50/90 ttm-connection-fading",
          connectionView?.urgency === "critical" && "border-amber-400/50",
          connectionView?.stage === "stable" && "border-[var(--tile-border-strong)]",
          "active:scale-[0.99]"
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
          emotionalPresence={inboxPresence}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[15px] truncate text-foreground">{profile.name}</p>
            {syncMetrics && (
              <span className="shrink-0 text-[9px] tabular-nums uppercase tracking-wider text-muted-foreground">
                SYNC {syncMetrics.syncPercent}%
              </span>
            )}
            {unread && (
              <span className="shrink-0 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {unreadLabel}
              </span>
            )}
            {bondActive && (
              <span className="shrink-0 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-100/90">
                {t("bondInboxBadge").replace("{hours}", String(prolongCount * BOND_PROLONG_HOURS))}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-normal truncate mt-0.5">{last?.text}</p>
          <p className="text-[10px] text-muted-foreground font-normal mt-1 truncate">
            {t(inboxPresence.labelKey)}
            {connectionView && (
              <span className="text-muted-foreground/70">
                {" "}
                · {stageLabel(connectionView.stage, copy)}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[10px] text-muted-foreground tabular-nums font-normal">{previewTime}</span>
          {connectionView && (
            <ConnectionTimer view={connectionView} compact stableLabel={copy.stableLabel} />
          )}
        </div>
      </button>
    </motion.li>
  )
}
