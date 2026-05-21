"use client"

import { useActivityFeed } from "@/components/activity/activity-feed-context"
import { FloatingToastStack } from "@/components/activity/floating-toast-stack"
import { ActivityHubSheet } from "@/components/activity/activity-hub-sheet"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ActivityAppChrome() {
  const { t } = useI18n()
  const { hubOpen, setHubOpen, toasts, dismissToast, counts, threads, reconnectThreads } = useActivityFeed()
  const total = counts.likesUnread + counts.chatsUnread

  return (
    <>
      <button
        type="button"
        onClick={() => setHubOpen(true)}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors touch-manipulation",
          "border-white/12 bg-white/[0.06] hover:border-white/16 hover:bg-white/06"
        )}
        aria-label={t("activityHubTitle")}
      >
        <svg className="w-5 h-5 text-foreground/85" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br cin-btn-primary text-[10px] text-white flex items-center justify-center font-medium shadow-lg shadow-black/30">
            {total > 9 ? "9+" : total}
          </span>
        )}
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
