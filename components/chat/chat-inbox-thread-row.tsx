"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Trash2 } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

export function ChatInboxThreadRow({
  thread,
  profile,
  locale,
  index,
  unreadLabel,
  paused = false,
  isActive = false,
  compact = false,
  onOpen,
  onDelete,
}: {
  thread: ChatThread
  profile: SwipeProfile
  locale: Locale
  index: number
  unreadLabel: string
  paused?: boolean
  isActive?: boolean
  /** Narrow inbox column (desktop sidebar) */
  compact?: boolean
  onOpen: (profileId: number) => void
  onDelete?: (profileId: number) => void
}) {
  const { t } = useI18n()
  const [deleteOpen, setDeleteOpen] = useState(false)
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

  const handleConfirmDelete = () => {
    onDelete?.(thread.profileId)
    setDeleteOpen(false)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25), type: "spring", stiffness: 380, damping: 28 }}
      className={cn("relative min-w-0 group/row", compact && "ttm-chat-inbox__thread-row--compact")}
    >
      <button
        type="button"
        onClick={() => onOpen(thread.profileId)}
        className={cn(
          "ttm-chat-inbox__row-btn ttm-surface-tile w-full min-w-0 rounded-[1.35rem] flex items-stretch text-left touch-manipulation transition-all duration-300 backdrop-blur-xl",
          compact ? "gap-3.5 px-3.5 py-3 min-h-[76px]" : "gap-3.5 p-3.5 min-h-[84px]",
          onDelete && (compact ? "pr-9" : "pr-10"),
          isActive && "ttm-chat-inbox__row--active",
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
        <div className="ttm-chat-inbox__row-avatar shrink-0 flex items-center self-center">
          <ChatProfileAvatar
            src={profile.image}
            name={profile.name}
            profileId={profile.id}
            size={compact ? "sm" : "md"}
            syncMetrics={syncMetrics}
            emotionalPresence={inboxPresence}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden py-0.5 self-center">
          <div className="flex items-baseline justify-between gap-3 min-w-0">
            <p
              className={cn(
                "font-medium truncate text-foreground min-w-0",
                compact ? "text-[14px]" : "text-[15px]"
              )}
            >
              {profile.name}
            </p>
            <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums font-normal">
              {previewTime}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-normal truncate mt-1 pr-1">
            {syncMetrics && compact ? (
              <span className="text-muted-foreground/70 tabular-nums">{syncMetrics.syncPercent}% · </span>
            ) : null}
            {last?.text}
          </p>
          {!compact && (
            <div className="flex items-center gap-2 mt-1 min-w-0">
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
              <p className="text-[10px] text-muted-foreground font-normal truncate min-w-0 flex-1">
                {t(inboxPresence.labelKey)}
                {connectionView && (
                  <span className="text-muted-foreground/70">
                    {" "}
                    · {stageLabel(connectionView.stage, copy)}
                  </span>
                )}
              </p>
            </div>
          )}
          {compact && (unread || bondActive) && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {unread && (
                <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  {unreadLabel}
                </span>
              )}
              {bondActive && (
                <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-100/90">
                  {t("bondInboxBadge").replace("{hours}", String(prolongCount * BOND_PROLONG_HOURS))}
                </span>
              )}
            </div>
          )}
        </div>
        {connectionView ? (
          <div className="ttm-chat-inbox__row-timer flex flex-col items-end justify-end shrink-0 self-center pl-2 pr-0.5">
            <ConnectionTimer view={connectionView} compact stableLabel={copy.stableLabel} />
          </div>
        ) : null}
      </button>
      {onDelete ? (
        <>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="ttm-chat-inbox__delete"
            aria-label={t("chatDeleteAria")}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden />
          </button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("chatDeleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("chatDeleteBody")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("chatDeleteCancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-rose-600 hover:bg-rose-600/90"
                >
                  {t("chatDeleteConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </motion.li>
  )
}
