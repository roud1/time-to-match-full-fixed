"use client"

import { motion } from "motion/react"
import type { ChatThread } from "@/lib/social-store"
import type { SwipeProfile } from "@/lib/demo-profiles"
import type { ConnectionMemory } from "@/lib/connection-system"
import type { Locale } from "@/lib/i18n"
import { ChatInboxThreadRow } from "@/components/chat/chat-inbox-thread-row"
import { ConnectionMemories } from "@/components/connection/connection-memories"
import { EmotionalEmptyState } from "@/components/product/emotional-empty-state"
import { MessageCircle } from "lucide-react"

export function ChatThreadSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-1" aria-busy aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-[76px] rounded-[1.35rem] border border-white/8 bg-white/[0.04] animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

export function ChatInboxScreen({
  threads,
  locale,
  profilesByThread,
  loading,
  memories = [],
  connectionsPaused = false,
  onOpen,
  labels,
}: {
  threads: ChatThread[]
  locale: Locale
  profilesByThread: Map<number, SwipeProfile>
  loading: boolean
  memories?: ConnectionMemory[]
  connectionsPaused?: boolean
  onOpen: (profileId: number) => void
  labels: {
    title: string
    subtitle: string
    empty: string
    emptyTitle: string
    emptyBody: string
    urgency: string
    reconnect: string
    unread: string
    memoryTitle: string
    memoryDays: (days: number) => string
    memoryFaded: string
    memoryExpired: string
  }
}) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] max-w-lg mx-auto w-full px-3 sm:px-4 pt-3 pb-6">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 space-y-2 shrink-0"
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-11 h-11 rounded-full border border-white/12 flex items-center justify-center text-[9px] uppercase tracking-wider text-white/50 font-extralight"
            aria-hidden
          >
            SYNC
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extralight tracking-tight text-foreground/95">
              {labels.title}
            </h1>
            <p className="text-sm text-muted-foreground font-light leading-relaxed mt-1">{labels.subtitle}</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] via-[#0a0a0f] to-violet-950/25 px-4 py-2.5 backdrop-blur-md"
        >
          <p className="text-[11px] sm:text-xs text-white/75 font-light leading-relaxed">{labels.urgency}</p>
        </motion.div>
      </motion.header>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="text-[11px] text-center text-muted-foreground/80 font-light mb-4 px-2"
      >
        {labels.reconnect}
      </motion.p>

      {loading ? (
        <ChatThreadSkeleton />
      ) : threads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <EmotionalEmptyState
            title={labels.emptyTitle}
            body={labels.emptyBody}
            icon={MessageCircle}
            className="w-full max-w-sm"
          />
        </div>
      ) : (
        <ul className="space-y-2.5 flex-1 min-h-0">
          {threads.map((thread, index) => {
            const profile = profilesByThread.get(thread.profileId)
            if (!profile) return null
            return (
              <ChatInboxThreadRow
                key={thread.profileId}
                thread={thread}
                profile={profile}
                locale={locale}
                index={index}
                unreadLabel={labels.unread}
                paused={connectionsPaused}
                onOpen={onOpen}
              />
            )
          })}
        </ul>
      )}

      <ConnectionMemories
        memories={memories}
        title={labels.memoryTitle}
        daysLabel={labels.memoryDays}
        fadedLabel={labels.memoryFaded}
        expiredLabel={labels.memoryExpired}
      />
    </div>
  )
}
