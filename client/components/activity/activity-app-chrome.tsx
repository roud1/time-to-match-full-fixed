"use client"

import { useActivityFeed } from "@/client/components/activity/activity-feed-context"
import { FloatingToastStack } from "@/client/components/activity/floating-toast-stack"
import { ActivityHubSheet } from "@/client/components/activity/activity-hub-sheet"
import { useI18n } from "@/client/lib/i18n"
import { NotifyBadge } from "@/client/components/ui/notify-badge"
import { cn } from "@/client/lib/utils"

export function ActivityAppChrome() {
  const { t } = useI18n()
  const { hubOpen, setHubOpen, toasts, dismissToast, counts, threads, reconnectThreads } = useActivityFeed()
  const total = counts.likesUnread + counts.chatsUnread

  return (
    <>
      <button
        type="button"
        onClick={() => setHubOpen(true)}
        className={cn("ttm-header-icon-btn relative shrink-0")}
        aria-label={t("activityHubTitle")}
        aria-expanded={hubOpen}
      >
        <svg className="w-5 h-5 text-foreground/85" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <NotifyBadge count={total} className="ttm-notify-badge--header" />
      </button>
      <FloatingToastStack toasts={toasts} onDismiss={dismissToast} />
      <ActivityHubSheet
        open={hubOpen}
        onClose={() => setHubOpen(false)}
        counts={counts}
        threads={threads}
        reconnectThreads={reconnectThreads}
      />
    </>
  )
}
